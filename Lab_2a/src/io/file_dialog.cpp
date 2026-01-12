#include "io/file_dialog.h"
#include <iostream>
#include <filesystem>
#include <vector>
#include <string>
#include <limits>

namespace fs = std::filesystem;

namespace FileDialog {

    std::vector<std::string> openFile() {
        std::string possible_paths[] = {
            "../../scene/scenes",
            "scene/scenes",
            "../scene/scenes"
        };

        std::string scene_dir = "";
        for(const auto& p : possible_paths) {
            if (fs::exists(p) && fs::is_directory(p)) {
                 scene_dir = p;
                 break;
            }
        }

        if (scene_dir.empty()) {
            std::cerr << "[Warning] Could not auto-detect 'scene/scenes' directory." << std::endl;
            std::cout << "Please enter full path to an XML scene file: ";
            std::string path;
            std::cin >> path;
            return {path};
        }

        std::vector<std::string> files;
        std::cout << "========================================" << std::endl;
        std::cout << "Available scenes in '" << scene_dir << "':" << std::endl;
        std::cout << "========================================" << std::endl;
        
        int index = 1;
        // Iterate over the directory
        for (const auto& entry : fs::directory_iterator(scene_dir)) {
            if (entry.path().extension() == ".xml") {
                files.push_back(entry.path().string());
                std::cout << "[" << index << "] " << entry.path().filename().string() << std::endl;
                index++;
            }
        }

        std::cout << "----------------------------------------" << std::endl;
        std::cout << "[a] Run All Scenes" << std::endl;
        std::cout << "[c] Enter Custom Path" << std::endl;
        std::cout << "========================================" << std::endl;

        if (files.empty()) {
             std::cout << "No .xml files found in folder." << std::endl;
             std::cout << "Please enter file path: ";
             std::string path;
             std::cin >> path;
             return {path};
        }

        std::cout << "Enter selection: ";
        
        std::string input;
        std::cin >> input;

        if (input == "a" || input == "A") {
            std::cout << "Selected: ALL SCENES" << std::endl;
            return files;
        } else if (input == "c" || input == "C") {
            std::cout << "Enter custom file path: ";
            std::string path;
            std::cin >> path;
            return {path};
        } else {
            try {
                int choice = std::stoi(input);
                if (choice >= 1 && choice <= static_cast<int>(files.size())) {
                    std::string selected_file = files[choice - 1];
                    std::cout << "Selected: " << selected_file << std::endl;
                    return {selected_file};
                }
            } catch (...) {
                // Invalid input
            }
        }
        
        std::cout << "Invalid selection." << std::endl;
        return {};
    }

}

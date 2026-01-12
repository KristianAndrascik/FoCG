#include "math/vec3.h"
#include "io/image.h"
#include "io/image_saver.h"
#include "ray.h"


#include "camera.h"
#include "hittable_list.h"
#include "hittable.h"
#include "sphere.h"
#include "io/scene_parser.h"
#include "io/file_dialog.h"

#include <iostream>


int main(int argc, char* argv[]) {
   
    std::vector<std::string> scene_files;

    
    if (argc > 1) {
        scene_files.push_back(argv[1]);
    } else {
        std::cout << "Opening file picker..." << std::endl;
        scene_files = FileDialog::openFile();
    }

    if (scene_files.empty()) {
        std::cerr << "No scene file selected." << std::endl;
        return 1;
    }

    int success_count = 0;

    for (const auto& scene_file : scene_files) {
        std::cout << "\n----------------------------------------" << std::endl;
        std::cout << "Processing scene: " << scene_file << std::endl;
        
        camera cam;
        hittable_list scene;
        std::vector<Light> lights;
        color background;

        if (SceneParser::parse(scene_file, cam, scene, lights, background)) {
            cam.background_color = background;
            cam.render(scene, lights);
            success_count++;
        } else {
            std::cerr << "Failed to parse scene: " << scene_file << std::endl;
        }
    }

    std::cout << "\n========================================" << std::endl;
    std::cout << "Rendering Complete. " << success_count << "/" << scene_files.size() << " scenes successful." << std::endl;

    return 0;
}
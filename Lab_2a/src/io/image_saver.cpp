    #define STB_IMAGE_WRITE_IMPLEMENTATION
    #include "stb_image_write.h"
    #include "io/image_saver.h"
    #include <iostream>

    bool ImageSaver::save_png(const Image& img, const std::string& filename) {
        int channels = 3; 
        int stride = img.width * channels; 
        
        int result = stbi_write_png(filename.c_str(), img.width, img.height, channels, img.pixels.data(), stride);

        if (result == 0) {
            std::cerr << "[Error] Failed to save image: " << filename << std::endl;
            return false;
        }
        
        std::cout << "[Success] Saved PNG: " << filename << std::endl;
        return true;
    }

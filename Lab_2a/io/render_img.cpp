#include <iostream>


int main() {
    std::cout << "Rendering image..." << std::endl;
    
    // Image 

    int width = 256;
    int height = 256;

    // Simulate image rendering process using pmm
    std::cout << "P3" << std::endl;
    std::cout << width << " " << height << std::endl;
    std::cout << "255" << std::endl;
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x){
            
            // Simple gradient for demonstration
            // Color values store from 0 to 1

            float r = float(x) / float(width-1);
            float g = float(y) / float(height-1);
            float b = 0.0;
            
            // get the RGB values in the range of 0-255
            int ir = static_cast<int>(255.999 * r);
            int ig = static_cast<int>(255.999 * g);
            int ib = static_cast<int>(255.999 * b);
            std::cout << ir << " " << ig << " " << ib << "\n";
        }
    }



    std::cout << "Image rendered successfully!" << std::endl;
    return 0;
}
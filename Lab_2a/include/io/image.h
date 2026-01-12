#ifndef IMAGE_H
#define IMAGE_H

#include <vector>
#include <cstdint>
#include "math/vec3.h"

class Image {
public:
    int width;
    int height;
    std::vector<uint8_t> pixels;

    Image(int w, int h) : width(w), height(h) {
        pixels.resize(width * height * 3);
    }

    void set_pixel(int x, int y, const color& c) {
        if (x < 0 || x >= width || y < 0 || y >= height) return;

        int index = (y * width + x) * 3;
        
        // Convert 0.0-1.0 to 0-255
        pixels[index + 0] = static_cast<uint8_t>(255.999 * c[0]);
        pixels[index + 1] = static_cast<uint8_t>(255.999 * c[1]);
        pixels[index + 2] = static_cast<uint8_t>(255.999 * c[2]);
    }
};

#endif

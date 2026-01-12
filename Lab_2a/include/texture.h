#ifndef TEXTURE_H
#define TEXTURE_H

#include <iostream>
#include <cmath>
#include <cstdlib> 
#include "math/vec3.h"

struct Texture {
    int width = 0;
    int height = 0;
    int channels = 0;
    unsigned char* data = nullptr;

    Texture() {}

    Texture(int w, int h, int c, unsigned char* d) 
        : width(w), height(h), channels(c), data(d) {}

    ~Texture() {
        if (data) {
             free(data); 
        }
    }

    color value(double u, double v) const {
        if (!data) return color(1, 0, 1); 

        u = u - std::floor(u);
        v = v - std::floor(v);

        u = 1.0 - u;
        v = v;

        int i = static_cast<int>(u * width);
        int j = static_cast<int>(v * height - 0.001);

        if (i < 0) i = 0;
        if (j < 0) j = 0;
        if (i > width - 1) i = width - 1;
        if (j > height - 1) j = height - 1;

        int index = (j * width + i) * channels;
        double scale = 1.0 / 255.0;
        
        return color(data[index] * scale, data[index+1] * scale, data[index+2] * scale);
    }
};

#endif

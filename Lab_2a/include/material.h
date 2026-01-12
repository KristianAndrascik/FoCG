#ifndef MATERIAL_H
#define MATERIAL_H

#include "math/vec3.h"
#include "texture.h"
#include <memory>

struct Material {
    color diffuse = color(1, 0, 1); 
    std::shared_ptr<Texture> texture;
    
    /// phong 
    double ka = 0; 
    double kd = 0; 
    double ks = 0; 
    double exponent = 0; 

    double reflectance = 0;
    double transmittance = 0;
    double iof = 1.0; 

    Material() {}
};

#endif

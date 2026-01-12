#ifndef LIGHT_H
#define LIGHT_H

#include "math/vec3.h"

enum LightType {
    AMBIENT,
    POINT,
    PARALLEL,
    SPOT
};

struct Light {
    LightType type;
    color light_color;
    point3 position;
    vec3 direction;
    double spot_alpha1; 
    double spot_alpha2; 
};

#endif

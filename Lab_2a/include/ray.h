#ifndef RAY_H
#define RAY_H

#include "math/vec3.h"


class ray {
public:

    vec3 origin;
    vec3 direction;

    ray(const vec3& orig, const vec3& dir) : origin(orig), direction(dir) {}

    point3 solve(double t) const {
        return origin + t * direction;
    }

};

# endif
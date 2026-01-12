#ifndef SCENE_PARSER_H
#define SCENE_PARSER_H

#include "hittable_list.h"
#include "camera.h"
#include "light.h"
#include "math/vec3.h"
#include <string>
#include <vector>

class SceneParser {
public:
    static bool parse(const std::string& filename, camera& cam, hittable_list& world, std::vector<Light>& lights, color& background);
};

#endif

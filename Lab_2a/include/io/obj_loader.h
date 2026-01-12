#ifndef OBJ_LOADER_H
#define OBJ_LOADER_H

#include <string>
#include <vector>
#include <memory>
#include "hittable.h"
#include "material.h"

std::vector<std::shared_ptr<hittable>> load_obj(const std::string& filename, std::shared_ptr<Material> mat);

#endif

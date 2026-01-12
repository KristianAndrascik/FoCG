#ifndef MESH_H
#define MESH_H

#include "hittable.h"
#include "triangle.h"
#include "math/vec3.h"
#include <vector>
#include <memory>
#include <limits>
#include <iostream>

class Mesh : public hittable {
public:
    std::vector<std::shared_ptr<hittable>> triangles;
    point3 min_bound;
    point3 max_bound;

    Mesh(const std::vector<std::shared_ptr<hittable>>& tris) : triangles(tris) {
        if (triangles.empty()) return;
        
        // Initialize bounds with large inverted values
        double infinity = std::numeric_limits<double>::infinity();
        min_bound = point3(infinity, infinity, infinity);
        max_bound = point3(-infinity, -infinity, -infinity);

        bool first = true;
        for (const auto& h : triangles) {
            auto tri = std::dynamic_pointer_cast<triangle>(h);
            if (!tri) continue;

            if (first) {
                 // Initialize with first vertex of first valid triangle to avoid infinity issues if mesh is weird
                 min_bound = tri->v0;
                 max_bound = tri->v0;
                 first = false;
            }

            // Check all 3 vertices of the triangle
            for (const auto& v : {tri->v0, tri->v1, tri->v2}) {
                for (int i = 0; i < 3; i++) {
                    if (v[i] < min_bound[i]) min_bound[i] = v[i];
                    if (v[i] > max_bound[i]) max_bound[i] = v[i];
                }
            }
        }
        
        // Slightly expand AABB to avoid zero-thickness issues for flat meshes
        for (int i=0; i<3; i++) {
            if (max_bound[i] - min_bound[i] < 0.0001) {
                max_bound[i] += 0.0001;
                min_bound[i] -= 0.0001;
            }
        }
    }

    bool intersectAABB(const ray& r, double t_min, double t_max) const {
        for (int a = 0; a < 3; a++) {
            auto invD = 1.0f / r.direction[a];
            auto t0 = (min_bound[a] - r.origin[a]) * invD;
            auto t1 = (max_bound[a] - r.origin[a]) * invD;
            if (invD < 0.0f) std::swap(t0, t1);
            
            t_min = t0 > t_min ? t0 : t_min;
            t_max = t1 < t_max ? t1 : t_max;
            
            if (t_max <= t_min)
                return false;
        }
        return true;
    }

    bool hit(const ray& r, double t_min, double t_max, hit_record& rec) const override {
        // Crucial Step: call intersectAABB first
        if (!intersectAABB(r, t_min, t_max)) return false;

        bool hit_anything = false;
        double closest_so_far = t_max;

        // Only loop through the triangles if the ray hits the box
        for (const auto& object : triangles) {
            if (object->hit(r, t_min, closest_so_far, rec)) {
                hit_anything = true;
                closest_so_far = rec.t;
            }
        }

        return hit_anything;
    }
};

#endif

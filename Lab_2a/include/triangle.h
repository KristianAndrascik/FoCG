#ifndef TRIANGLE_H
#define TRIANGLE_H

#include "hittable.h"
#include "math/vec3.h"

class triangle : public hittable {
public:
    point3 v0, v1, v2;
    vec3 n0, n1, n2; 
    vec3 uv0, uv1, uv2; 
    bool has_normals = false;
    bool has_tex = false;
    std::shared_ptr<Material> mat_ptr;

    triangle(const point3& _v0, const point3& _v1, const point3& _v2, std::shared_ptr<Material> m)
        : v0(_v0), v1(_v1), v2(_v2), mat_ptr(m) {
        has_normals = false;
        has_tex = false;
    }

    triangle(const point3& _v0, const point3& _v1, const point3& _v2, 
             const vec3& _n0, const vec3& _n1, const vec3& _n2, std::shared_ptr<Material> m)
        : v0(_v0), v1(_v1), v2(_v2), n0(_n0), n1(_n1), n2(_n2), mat_ptr(m) {
        has_normals = true;
        has_tex = false;
    }

    triangle(const point3& _v0, const point3& _v1, const point3& _v2, 
             const vec3& _n0, const vec3& _n1, const vec3& _n2, 
             const vec3& _uv0, const vec3& _uv1, const vec3& _uv2, std::shared_ptr<Material> m)
        : v0(_v0), v1(_v1), v2(_v2), n0(_n0), n1(_n1), n2(_n2), uv0(_uv0), uv1(_uv1), uv2(_uv2), mat_ptr(m) {
        has_normals = true;
        has_tex = true;
    }

    bool hit(const ray& r, double ray_tmin, double ray_tmax, hit_record& rec) const override {
        const double EPSILON = 0.0000001;
        
        vec3 edge1 = v1 - v0;
        vec3 edge2 = v2 - v0;
        vec3 h = cross(r.direction, edge2);
        double a = dot(edge1, h);

        if (a > -EPSILON && a < EPSILON)
            return false; // This ray is parallel to this triangle.

        double f = 1.0 / a;
        vec3 s = r.origin - v0;
        double u = f * dot(s, h);

        if (u < 0.0 || u > 1.0)
            return false;

        vec3 q = cross(s, edge1);
        double v = f * dot(r.direction, q);

        if (v < 0.0 || u + v > 1.0)
            return false;

        double t = f * dot(edge2, q);

        if (t > ray_tmin && t < ray_tmax) {
            rec.t = t;
            rec.p = r.solve(rec.t);
            
            vec3 normal;
            if (has_normals) {
                // Barycentric interpolation of normals
                // u is weight for v1, v is weight for v2, (1-u-v) is weight for v0
                normal = unit_vector((1 - u - v) * n0 + u * n1 + v * n2);
            } else {
                normal = unit_vector(cross(edge1, edge2));
            }
            
            rec.set_face_normal(r, normal);
            
            if (has_tex) {
                // Barycentric interpolation of texture coordinates
                 vec3 tex = (1 - u - v) * uv0 + u * uv1 + v * uv2;
                 rec.u = tex.v[0];
                 rec.v = tex.v[1];
            } else {
                 rec.u = 0;
                 rec.v = 0;
            }

            rec.mat_ptr = mat_ptr;
            return true;
        }

        return false;
    }
};

#endif

#ifndef SPHERE_H
#define SPHERE_H

#include "hittable.h"
#include "math/vec3.h"
#include "math/matrix.h"

class sphere : public hittable {
  public:
    point3 center;
    double radius;
    std::shared_ptr<Material> mat_ptr;
    
    vec3 translate_val = vec3(0,0,0);
    vec3 rotate_val = vec3(0,0,0);
    vec3 scale_val = vec3(1,1,1);
    bool is_transformed = false;

    Matrix4 inverse_transform;
    Matrix4 normal_transform; 
    Matrix4 forward_transform;

    sphere(const point3& center, double radius, std::shared_ptr<Material> m)
      : center(center), radius(std::fmax(0,radius)), mat_ptr(m), is_transformed(false) {}

    sphere(const point3& center, double radius, std::shared_ptr<Material> m, 
           const vec3& t, const vec3& r, const vec3& s)
      : center(center), radius(std::fmax(0,radius)), mat_ptr(m), 
        translate_val(t), rotate_val(r), scale_val(s) {
        
        is_transformed = (t.v[0]!=0 || t.v[1]!=0 || t.v[2]!=0 ||
                          r.v[0]!=0 || r.v[1]!=0 || r.v[2]!=0 ||
                          s.v[0]!=1 || s.v[1]!=1 || s.v[2]!=1);

        if (is_transformed) {
            Matrix4 S = Matrix4::scale(s[0], s[1], s[2]);
            
            Matrix4 Rx = Matrix4::rotateX(r[0]);
            Matrix4 Ry = Matrix4::rotateY(r[1]);
            Matrix4 Rz = Matrix4::rotateZ(r[2]);
            Matrix4 R = Rz * Ry * Rx;
            
            Matrix4 T = Matrix4::translate(t[0], t[1], t[2]);

            forward_transform = T * R * S;

            Matrix4 S_inv = Matrix4::scale(1.0/s[0], 1.0/s[1], 1.0/s[2]);
            
            Matrix4 Rx_inv = Matrix4::rotateX(-r[0]);
            Matrix4 Ry_inv = Matrix4::rotateY(-r[1]);
            Matrix4 Rz_inv = Matrix4::rotateZ(-r[2]);
            Matrix4 R_inv = Rx_inv * Ry_inv * Rz_inv;
            
            Matrix4 T_inv = Matrix4::translate(-t[0], -t[1], -t[2]);

            inverse_transform = S_inv * R_inv * T_inv;

            normal_transform = inverse_transform.transpose();
        }
    }

    bool hit(const ray& r_in, double ray_tmin, double ray_tmax, hit_record& rec) const override {
        ray r = r_in;
        
        if (is_transformed) {
             point3 o = inverse_transform.transform_point(r.origin);
             vec3 d = inverse_transform.transform_vector(r.direction);
             r = ray(o, d);
        }

        vec3 oc = r.origin - center;
        auto a = dot(r.direction, r.direction);
        auto half_b = dot(oc, r.direction);
        auto c = dot(oc, oc) - radius*radius;

        auto discriminant = half_b*half_b - a*c;
        if (discriminant < 0) return false;

        auto sqrtd = std::sqrt(discriminant);

        auto root = (-half_b - sqrtd) / a;
        if (root <= ray_tmin || ray_tmax <= root) {
            root = (-half_b + sqrtd) / a;
            if (root <= ray_tmin || ray_tmax <= root)
                return false;
        }

        rec.t = root;
        point3 p_obj = r.solve(rec.t);
        
        vec3 outward_normal = (p_obj - center) / radius;

        if (is_transformed) {
            rec.p = forward_transform.transform_point(p_obj);

            vec3 n = normal_transform.transform_vector(outward_normal);
            outward_normal = unit_vector(n);
        } else {
             rec.p = p_obj;
        }


        rec.set_face_normal(r_in, outward_normal); 
        rec.mat_ptr = mat_ptr;
        
        if (is_transformed) {
             vec3 n_obj = unit_vector(p_obj - center);
             
             double u = 0.5 + atan2(n_obj.v[2], n_obj.v[0]) / (2 * 3.14159265359);
             double v = 0.5 + asin(n_obj.v[1]) / 3.14159265359;
             
             rec.u = u; rec.v = v;
        } else {
             vec3 n_obj = outward_normal; 
             double u = 0.5 + atan2(n_obj.v[2], n_obj.v[0]) / (2 * 3.14159265359);
             double v = 0.5 + asin(n_obj.v[1]) / 3.14159265359;
             rec.u = u; rec.v = v;
        }

        return true;
    }
};

#endif

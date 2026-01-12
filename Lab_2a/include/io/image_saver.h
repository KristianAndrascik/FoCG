#ifndef IMAGE_SAVER_H
#define IMAGE_SAVER_H

#include <string>
#include "io/image.h" 

class ImageSaver {
public:
    static bool save_png(const Image& img, const std::string& filename);
};

#endif

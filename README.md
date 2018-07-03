# Entwine/Cesium Pages

## What is this?
A set of static pages that allows you to easily view your at-rest [Entwine](https://entwine.io)-indexed point cloud data within [Cesium](https://cesiumjs.org).  This is accomplished using the [3D Tiles](https://github.com/AnalyticalGraphicsInc/3d-tiles) specification for point clouds.

For example, here is a 4.7-billion point tileset of New York City using the contents of this repository: [http://cesium.entwine.io?resource=nyc](http://cesium.entwine.io?resource=nyc).

## How do I use it?

### Build a tileset
We can build a tileset locally and view it with Cesium.  First, pull the latest Entwine [Docker](https://www.docker.com/) image and index some data to create an [Entwine Point Tile](https://github.com/connormanning/entwine/blob/master/doc/entwine-point-tile.md) dataset.  We'll need to reproject to `EPSG:4978`.
```
docker run -it \
    -v ~/entwine:/entwine \
    connormanning/entwine build \
        -i https://entwine.io/data/red-rocks.laz \
        -o /entwine/red-rocks-ecef \
        -r EPSG:4978
```

Then, convert this EPT dataset to 3D Tiles.
```
docker run -it \
    -v ~/entwine:/entwine \
    connormanning/entwine convert \
        -i /entwine/red-rocks-ecef \
        -o /entwine/cesium/red-rocks
```

Now we'll need to statically serve this data over HTTP.
```
docker run -it \
    -v ~/entwine/cesium:/var/www \
    -p 8080:8080 \
    connormanning/http-server
```

Now we can view the data [here](http://cesium.entwine.io/?url=http://localhost:8080/red-rocks).

## Licensing
This repository consists mostly of a compiled version of Cesium, which is Apache licensed.  The rest of the repository will adopt the Apache license as well.  See the full license [here](https://github.com/connormanning/entwine-cesium-pages/blob/master/LICENSE.md).


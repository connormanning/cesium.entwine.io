# Entwine/Cesium Pages

## What is this?
A set of static pages that allows you to easily view your at-rest [Entwine](https://entwine.io)-indexed point cloud data within [Cesium](https://cesiumjs.org).  This is accomplished using the [3D Tiles](https://github.com/AnalyticalGraphicsInc/3d-tiles) specification for point clouds.

For example, here is a 4.7-billion point tileset of New York City using the contents of this repository: [http://cesium.entwine.io?resource=nyc](http://cesium.entwine.io?resource=nyc).

## How do I use it?

### Getting started
```
git clone git@github.com:connormanning/entwine-cesium-pages.git ~/entwine-cesium-pages
cd entwine-cesium-pages
```

Now, statically serve the current directory.  With Python:  
```
python -m SimpleHTTPServer 9000     # Python 2.x
python -m http.server 9000          # Python 3.x
```

Now browse to [http://localhost:9000?resource=sample](http://localhost:9000?resource=sample) to view a very small and sparse sample dataset.

### Building your own tilesets
Now let's build a tileset locally and view it.  First, pull the latest Entwine `cesium` tag with [Docker](https://www.docker.com/).
```
docker pull connormanning/entwine:cesium
```

Now let's build a small sample set using Entwine's `cesium` template, sending our output to the `data` subdirectory of the `entwine-cesium-pages` repository we cloned earlier.

```
docker run -it \
    -v ~/entwine-cesium-pages/data:/opt/output \
    connormanning/entwine:cesium \
    entwine build /entwine/config/cesium.json \
        -i https://s3.amazonaws.com/hobu-lidar/red-rocks/red-rocks.laz \
        -o /opt/output/red-rocks
```

After the log that says `Save complete`, browse to [http://localhost:9000?resource=red-rocks](http://localhost:9000?resource=red-rocks) to see the results.

### What just happened?
Using the `cesium.json` configuration template caused Entwine to reproject the data to match Cesium's view of the world for indexing, and also produced an output that conforms to the 3D tile specification.  This allows it to be displayed in Cesium with the `3d-tiles` branch, which is compiled and bundled in this repository.

### What next?
By replacing the arguments to `-i` (input) and `-o` (output) from the command above, you can build more of your own datasets locally and view them in Cesium.

## Anything else?

### What could go wrong?
Your data needs to contain accurate coordinate system information so that it can be reprojected properly.  Otherwise you may get errors during indexing or be unable to view your output properly.  If the elevation offsets aren't correct for your data's projection, then your output may end up floating far above or below the earth's surface when viewed in Cesium.

### State of Entwine's 3D Tiles output
Entwine's 3D tiles is very much a prototype.  It may change, and doesn't support some things that the rest of Entwine supports.  For example, subset builds and merges are not supported for `cesium`-style builds.  Neither are continued builds (full support will come soon).  Modifying certain configuration entries, which would otherwise be supported, may produce invalid outputs.

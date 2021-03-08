Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDU0ZmY5MC05NGQ2LTQ2MzItYTU2ZC1kOTA2MmI0MzlmODciLCJpZCI6NDU1MSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0MTA5NTY0Mn0.HYTFh-384LduDB2N4c3kOTR5W_7HAy8eKbNJYPVHwLw";

const query = Object.fromEntries(new URLSearchParams(window.location.search));

const setMessage = (message) => {
  const node = document.getElementById("message");

  if (!message) {
    node.style.display = "none";
    return;
  }

  node.style.display = "";
  node.textContent = message;
};

// The URL is plucked out and added to the renderer as the tileset target, and
// the rest of the params are forwarded to the tileset endpoint.
const {
  url,
  "point-size": pointSize = 2.5,
  "truncate-intensity": rawTruncateIntensity,
  ...forward
} = query;

const truncateIntensity =
  rawTruncateIntensity === "true" || rawTruncateIntensity === "1";

// If no URL, then we're on the main page.
if (!url) {
  document.getElementById("top").style.display = "block";
  document.getElementById("entwine-logo").style.display = "none";
} else {
  setMessage("Loading...");

  // And if we have a URL, then we're rendering a tileset.
  const style = document.createElement("style");
  style.innerHTML =
    "body, html { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; } #top { display: none; }";
  document.body.appendChild(style);

  const imageryProviders = Cesium.createDefaultImageryProviderViewModels();
  const terrainProviders = Cesium.createDefaultTerrainProviderViewModels();

  const viewer = new Cesium.Viewer("cesiumContainer", {
    creditContainer: "nullContainer",
    imageryProviderViewModels: imageryProviders,
    selectedImageryProviderViewModel: imageryProviders[0],
    terrainProviderViewModels: terrainProviders,
    selectedTerrainProviderViewModel: terrainProviders[1],
  });

  const forwardQuery = new URLSearchParams(forward).toString();
  const fullUrl = url + (forwardQuery.length ? `?${forwardQuery}` : "");
  const tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({ url: fullUrl })
  );
  window.tileset = tileset;

  tileset.readyPromise.then(() => {
    try {
      setMessage();
      console.log("Loaded tileset");
      console.log("Asset", tileset.asset);
      console.log("Properties", tileset.properties);

      const divisor = truncateIntensity ? 256 : 1;

      const color = tileset.asset.ept.schema.some((d) => d.name === "Red")
        ? undefined // Use the included RGB if it exists
        : tileset.asset.options.dimensions.includes("Intensity")
        ? `rgb(\${Intensity} / ${divisor}, \${Intensity} / ${divisor}, \${Intensity} / ${divisor})`
        : undefined;

      console.log("Color", color);

      tileset.style = new Cesium.Cesium3DTileStyle({ color, pointSize });

      tileset.pointCloudShading.attenuation = true;
      tileset.pointCloudShading.eyeDomeLighting = true;
      tileset.pointCloudShading.eyeDomeLightingStrength = 2;
      tileset.pointCloudShading.eyeDomeLightingRadius = 2;

      const bounding = tileset._root._boundingVolume;
      const center = bounding.boundingSphere.center;
      const cart = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);

      const destination = Cesium.Cartesian3.fromDegrees(
        cart.longitude * (180 / Math.PI),
        cart.latitude * (180 / Math.PI),
        bounding._boundingSphere.radius * 0.8
      );

      viewer.camera.setView({ destination });
    } catch (e) {
      console.error(e);
      setMessage(e.message || "An unknown error occurred");
    }
  });
}

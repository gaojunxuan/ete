// Download-related functions.

import { view, get_tid } from "./gui.js";
import { api } from "./api.js";
import { apps } from "./pixi.js";

export { download_newick, download_seqs, download_image, download_svg };


// Download a file with the newick representation of the tree.
async function download_newick(node_id) {
    const nid = get_tid() + (node_id ? "," + node_id : "");
    const newick = await api(`/trees/${nid}/newick`);
    download(view.tree + ".tree", "data:text/plain;charset=utf-8," + newick);
}

async function download_seqs(node_id) {
    const nid = get_tid() + (node_id ? "," + node_id : "");
    const fasta = await api(`/trees/${nid}/seq`);
    download(view.tree + ".fasta", "data:text/plain;charset=utf-8," + fasta);
}


// Download a file with the current view of the tree as a svg.
function download_svg() {
    const app = Object.values(apps)[0];
    let graphics = new PIXI.Graphics()
        .beginFill(0xFF0000)
        .drawCircle(100, 100, 50);
    const img = app.renderer.plugins.extract.image(app.stage);
    console.log(app);
    console.log(app.stage.children[0])
    console.log(img);
    div_viz.appendChild(img);
    const svg = div_viz.cloneNode(true)
    // Remove foreground nodeboxes for faster rendering
    // (Background nodes not excluded as they are purposely styled)
    Array.from(svg.getElementsByClassName("fg_node")).forEach(e => e.remove());
    apply_css(svg, document.styleSheets[0]);
    const svg_xml = (new XMLSerializer()).serializeToString(svg);
    const content = "data:image/svg+xml;base64," + btoa(svg_xml);
    download(view.tree + ".svg", content);
}


// Download a file with the current view of the tree as a png.
function download_image() {
    // dom-to-image dependency
    domtoimage
        .toPng(div_viz, {
            filter: node =>
            // Remove foreground nodeboxes for faster rendering
            // (Background nodes not excluded as they are purposely styled)
            !(node.classList && [...node.classList].includes("fg_node"))
        })
        .then(content => download(view.tree + ".png", content));
}


// Apply CSS rules to elements contained in a (cloned) container
function apply_css(container, stylesheet) {
    let styles = [];
    Array.from(stylesheet.rules).forEach(r => {
        const style = r.cssText;
        if (style) 
            styles.push(style);
    })
    const style_element = document.createElement("style");
    style_element.innerHTML = styles.join("\n");
    container.appendChild(style_element);
}

// Make the browser download a file.
function download(fname, content) {
    const element = document.createElement("a");
    element.setAttribute("href", encodeURI(content));
    element.setAttribute("download", fname);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

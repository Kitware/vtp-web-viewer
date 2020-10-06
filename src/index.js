import 'vtk.js/Sources/favicon';

import vtkXMLPolyDataReader from 'vtk.js/Sources/IO/XML/XMLPolyDataReader';
import Base64 from 'vtk.js/Sources/Common/Core/Base64';
import { throttle } from 'vtk.js/Sources/macro';

// import axes from './axes.js';
import logo from './logo.js';
import measure from './measure.js';
import plotting from './plotting.js';
import ui from './ui.js';

// ----------------------------------------------------------------------------
// Standard scene code setup
// ----------------------------------------------------------------------------

const plotter = new plotting.Plotter();
// axes.addAxes(fullScreenRenderer);
logo.addLogo(plotter.fullScreenRenderer);

global.plotter = plotter;

// ----------------------------------------------------------------------------
// File IO
// ----------------------------------------------------------------------------

const reader = vtkXMLPolyDataReader.newInstance();
global.reader = reader;

function loadBase64Content (contentToLoad) {
  var buffer = Base64.toArrayBuffer(contentToLoad);
  reader.parseAsArrayBuffer(buffer);
  return reader.getOutputData(0);
}

// ----------------------------------------------------------------------------
// Where we inject a VTP file as a base64 string in `contentToLoad`
// ----------------------------------------------------------------------------

// INSERT DATA HERE:
var contentToLoad = 'this_is_the_content';

// now we have access to the PolyData
const polydata = loadBase64Content(contentToLoad);
global.polydata = polydata;

const actor = plotter.addMesh(polydata, { color: [0.824, 0.706, 0.549] });
if (polydata.getPointData().getActiveScalars() < 0) {
  polydata.getPointData().setActiveScalars('RGB');
  actor.getMapper().setColorModeToDirectScalars();
  actor.getMapper().setScalarVisibility(true);
  plotter.render();
}

const b = polydata.getBounds();
const length = Math.sqrt((b[1] - b[0]) ** 2 + (b[3] - b[2]) ** 2 + (b[5] - b[4]) ** 2);

// ----------------------------------------------------------------------------
// Distance Measurement Tool
// ----------------------------------------------------------------------------

// initialize UI with the single actor
ui.initUserInterface(plotter.fullScreenRenderer, actor);

const tool = new measure.DistanceTool(plotter.fullScreenRenderer, length * 0.05);
global.tool = tool;

function handlePickEvent (e) {
  /** On a P keypress, save the location. **/
  var keyCode = e.keyCode;
  if (keyCode === 112 || keyCode === 80) { // p key
    // console.log('You pressed P!');
    tool.savePickEvent();
  }
}

const throttleMouseHandler = throttle((event) => {
  tool.pickOnMouseEvent(event);
}, 100);
document.addEventListener('mousemove', throttleMouseHandler);

document.addEventListener('keypress', handlePickEvent);

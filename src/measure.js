import vtkOpenGLHardwareSelector from 'vtk.js/Sources/Rendering/OpenGL/HardwareSelector';
import vtkSphereSource from 'vtk.js/Sources/Filters/Sources/SphereSource';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkLineSource from 'vtk.js/Sources/Filters/Sources/LineSource';
import vtkTubeFilter from 'vtk.js/Sources/Filters/General/TubeFilter';

import { FieldAssociations } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';

import ui from './ui.js';

const GREEN = [0.1, 0.8, 0.1];
const RED = [1.0, 0.1, 0.1];

// ----------------------------------------------------------------------------
// Create Picking pointer
// ----------------------------------------------------------------------------

class DistanceTool {
  constructor (fullScreenRenderer) {
    this.interactor = fullScreenRenderer.getRenderWindow().getInteractor();
    this.openGLRenderWindow = this.interactor.getView();
    this.renderer = fullScreenRenderer.getRenderer();
    this.renderWindow = fullScreenRenderer.getRenderWindow();
    this.lastWorldPosition = null;
    this.pickedMarkers = [];

    // Create hardware selector
    this.hardwareSelector = vtkOpenGLHardwareSelector.newInstance({
      captureZValues: true
    });
    this.hardwareSelector.setFieldAssociation(
      FieldAssociations.FIELD_ASSOCIATION_POINTS
    );
    this.hardwareSelector.attach(this.openGLRenderWindow, this.renderer);

    // create the marker
    this.pointerSrcA = this._createMarkerSource();
    this.pointerA = this._createActorForSource(this.pointerSrcA);
    this.renderer.addActor(this.pointerA);
    this.pointerSrcB = this._createMarkerSource();
    this.pointerB = this._createActorForSource(this.pointerSrcB);
    this.renderer.addActor(this.pointerB);

    // create line
    this.lineSource = vtkLineSource.newInstance();
    this.tubeFilter = vtkTubeFilter.newInstance();
    this.tubeFilter.setInputConnection(this.lineSource.getOutputPort());
    this.lineActor = vtkActor.newInstance();
    const mapper = vtkMapper.newInstance();
    this.lineActor.setMapper(mapper);
    mapper.setInputConnection(this.tubeFilter.getOutputPort());
    this.renderer.addActor(this.lineActor);

    // UI to control marker size
    this.markerSizeSlider = document.getElementById('markerSize');
    this.markerSizeSlider.addEventListener('input', (e) => {
      const radius = Number(e.target.value);
      this.updateMarkerRadius(radius);
    });
    this.updateMarkerRadius(Number(this.markerSizeSlider.value));
    // Set up the toggle
    const controller = fullScreenRenderer.getControlContainer();
    const uiToggle = document.getElementById('toggle-measure');
    const uiContent = document.getElementById('measure-controller');
    ui.addToggleListener(controller, uiToggle, uiContent, this.toggleTool.bind(this));

    // flag to track which node is active
    // can be 0 (none/inactive), 1 (a), 2 (b)
    this.mode = 0;

    this.resetTool();
  }

  _createMarkerSource (phiResolution = 15, thetaResolution = 15, radius = 0.1) {
    /** Create a single marker and return the actor **/
    const pointerSource = vtkSphereSource.newInstance({
      phiResolution: phiResolution,
      thetaResolution: thetaResolution,
      radius: radius
    });
    return pointerSource;
  }

  _createActorForSource (pointerSource) {
    const mapper = vtkMapper.newInstance();
    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    mapper.setInputConnection(pointerSource.getOutputPort());
    return actor;
  }

  updateMarkerRadius (radius) {
    this.pointerSrcA.setRadius(radius / 10.0);
    this.pointerSrcB.setRadius(radius / 10.0);
    this.tubeFilter.setRadius(radius / 10.0 / 3.0);
    this.renderWindow.render();
  }

  eventToWindowXY (event) {
    // We know we are full screen => window.innerXXX
    // Otherwise we can use pixel device ratio or else...
    const { clientX, clientY } = event;
    const [width, height] = this.openGLRenderWindow.getSize();
    const x = Math.round((width * clientX) / window.innerWidth);
    const y = Math.round(height * (1 - clientY / window.innerHeight)); // Need to flip Y
    return [x, y];
  }

  resetTool () {
    /** Reset the markers and ready the tool for making a measurement **/
    this.pointerA.setVisibility(false);
    this.pointerB.setVisibility(false);
    this.lineActor.setVisibility(false);
    this.pointerA.getProperty().setColor(...GREEN);
    this.pointerB.getProperty().setColor(...GREEN);
    this.renderWindow.render();
  }

  toggleTool (state) {
    // Turn on/off tool. It will reset as well
    this.resetTool();
    if (!state) {
      this.mode = 0;
    } else {
      this.mode = 1;
    }
  }

  getActiveMarker () {
    let actor = null; // will be null if in mode 0
    if (this.mode === 1) {
      actor = this.pointerA;
    } else if (this.mode === 2) {
      actor = this.pointerB;
    }
    return actor;
  }

  updateLineSource () {
    this.lineSource.setPoint1(this.pointerA.getPosition());
    this.lineSource.setPoint2(this.pointerB.getPosition());
  }

  getDistance () {
    // retruns XYZ, XY, Z distances
    var a = this.pointerA.getPosition();
    var b = this.pointerB.getPosition();
    var xDiff = a[0] - b[0];
    var yDiff = a[1] - b[1];
    var zDiff = a[2] - b[2];
    var xyz = Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);
    var xy = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    return { xyz: xyz, xy: xy, z: Math.abs(zDiff) };
  }

  updateMarkerPosition (worldPosition) {
    // console.log(`update marker position to: ${worldPosition}`);
    const actor = this.getActiveMarker();
    actor.setVisibility(true);
    actor.setPosition(worldPosition);
    this.updateLineSource();
    this.renderWindow.render();

    if (this.mode === 2) {
      var d = this.getDistance();
      document.querySelector('#distance').innerText = d.xyz.toFixed(3).toString() + ', ' + d.xy.toFixed(3).toString() + ', ' + d.z.toFixed(3).toString();
    }
  }

  processSelections (selections) {
    // if nothing was selected, hide the marker and return
    if (!selections || selections.length === 0) {
      // console.log('no selections.');
      this.getActiveMarker().setVisibility(false);
      this.lastWorldPosition = null;
      this.renderWindow.render();
      return;
    }

    const { worldPosition, compositeID, prop } = selections[0].getProperties();
    this.selected = selections[0];

    this.lastWorldPosition = worldPosition;

    // Update picture for the user so we can see the green one
    this.updateMarkerPosition(worldPosition);
  }

  pickOnMouseEvent (event) {
    if (this.interactor.isAnimating() || this.mode === 0) {
      // We should not do picking when interacting with the scene
      // Also if the mode is inactive, do not pick
      return;
    }
    const [x, y] = this.eventToWindowXY(event);
    this.hardwareSelector.setArea(x, y, x, y);
    this.hardwareSelector.releasePixBuffers();

    // hide marker so that we do not pick it
    this.getActiveMarker().setVisibility(false);
    if (this.hardwareSelector.captureBuffers()) {
      this.processSelections(this.hardwareSelector.generateSelection(x, y, x, y));
    } else {
      console.log('no buffers');
      this.processSelections(null);
    }
  }

  savePickEvent () {
    if (this.lastWorldPosition) {
      switch (this.mode) {
        case 0:
          this.resetTool();
          this.mode = 1;
          break;
        case 1:
          this.pointerA.getProperty().setColor(...RED);
          this.pointerA.setVisibility(true);
          // Set the line to be at the picked point to avoid artifacts from last pick
          var p1 = this.pointerA.getPosition();
          var r = this.pointerSrcA.getRadius();
          // Slight adjustment to avoid zero-length line warning
          var p2 = [p1[0] + r, p1[1] + r, p1[2] + r];
          this.lineSource.setPoint1(p1);
          this.lineSource.setPoint2(p2);
          this.pointerB.setPosition(p2);
          this.pointerB.setVisibility(true);
          this.lineActor.setVisibility(true);
          this.mode = 2;
          break;
        case 2:
          this.pointerB.getProperty().setColor(...RED);
          this.mode = 0;
          break;
        default:
          // code block
      }
      this.renderWindow.render();
    }
  }
}

export default { DistanceTool };

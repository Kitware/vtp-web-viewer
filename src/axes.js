import vtkOrientationMarkerWidget from 'vtk.js/Sources/Interaction/Widgets/OrientationMarkerWidget';
import vtkAxesActor from 'vtk.js/Sources/Rendering/Core/AxesActor';
import vtkInteractiveOrientationWidget from 'vtk.js/Sources/Widgets/Widgets3D/InteractiveOrientationWidget';
import vtkWidgetManager from 'vtk.js/Sources/Widgets/Core/WidgetManager';
import * as vtkMath from 'vtk.js/Sources/Common/Core/Math';

function majorAxis (vec3, idxA, idxB) {
  const axis = [0, 0, 0];
  const idx = Math.abs(vec3[idxA]) > Math.abs(vec3[idxB]) ? idxA : idxB;
  const value = vec3[idx] > 0 ? 1 : -1;
  axis[idx] = value;
  return axis;
}

function addAxes (fullScreenRenderer) {
  const renderer = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();
  const camera = renderer.getActiveCamera();
  const render = renderWindow.render;

  const axes = vtkAxesActor.newInstance();
  const orientationWidget = vtkOrientationMarkerWidget.newInstance({
    actor: axes,
    interactor: renderWindow.getInteractor()
  });
  orientationWidget.setEnabled(true);
  orientationWidget.setViewportCorner(
    vtkOrientationMarkerWidget.Corners.BOTTOM_LEFT
  );
  orientationWidget.setViewportSize(0.15);
  orientationWidget.setMinPixelSize(100);
  orientationWidget.setMaxPixelSize(300);

  const widgetManager = vtkWidgetManager.newInstance();
  widgetManager.setRenderer(orientationWidget.getRenderer());

  const widget = vtkInteractiveOrientationWidget.newInstance();
  widget.placeWidget(axes.getBounds());
  widget.setBounds(axes.getBounds());
  widget.setPlaceFactor(1);

  const vw = widgetManager.addWidget(widget);

  // Manage user interaction
  vw.onOrientationChange(({ up, direction, action, event }) => {
    const focalPoint = camera.getFocalPoint();
    const position = camera.getPosition();
    const viewUp = camera.getViewUp();

    const distance = Math.sqrt(
      vtkMath.distance2BetweenPoints(position, focalPoint)
    );
    camera.setPosition(
      focalPoint[0] + direction[0] * distance,
      focalPoint[1] + direction[1] * distance,
      focalPoint[2] + direction[2] * distance
    );

    if (direction[0]) {
      camera.setViewUp(majorAxis(viewUp, 1, 2));
    }
    if (direction[1]) {
      camera.setViewUp(majorAxis(viewUp, 0, 2));
    }
    if (direction[2]) {
      camera.setViewUp(majorAxis(viewUp, 0, 1));
    }

    orientationWidget.updateMarkerOrientation();
    widgetManager.enablePicking();

    render();
  });

  widgetManager.enablePicking();
}

export default { addAxes };

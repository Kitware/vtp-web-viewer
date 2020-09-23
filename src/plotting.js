import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';

import interactor from './interactor.js';

class Plotter {
  constructor () {
    this.fullScreenRenderer = vtkFullScreenRenderWindow.newInstance(
      { background: [1, 1, 1] }
    );
    this.renderer = this.fullScreenRenderer.getRenderer();
    this.renderWindow = this.fullScreenRenderer.getRenderWindow();

    [this.style, this.resetCamera] = interactor.useVtkInteractorStyle(this.fullScreenRenderer);
  }

  addMesh (mesh, props) {
    const mapper = vtkMapper.newInstance();
    mapper.setInputData(mesh);
    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    const prop = actor.getProperty();
    prop.set(props);

    this.renderer.addActor(actor);
    this.resetCamera();
    this.renderWindow.render();

    return actor;
  }
}

export default { Plotter };

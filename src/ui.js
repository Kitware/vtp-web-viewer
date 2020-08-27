import controlPanel from './controller.html';

function initUserInterface (fullScreenRenderer, actor) {
  fullScreenRenderer.addController(controlPanel);

  const controller = fullScreenRenderer.getControlContainer();
  controller.style['background-color'] = '#DCDCDC';

  const render = fullScreenRenderer.getRenderWindow().render;

  const uiToggle = document.getElementById('toggle');
  const uiContent = document.getElementById('content');
  const representationSelector = document.getElementById('representations');
  const pointSizeChange = document.getElementById('pointSize');
  const pointSizeRow = document.getElementById('pointSizeRow');
  const lightingChange = document.getElementById('lighting');
  const lightingRow = document.getElementById('lightingRow');
  const ambientChange = document.getElementById('ambient');
  const colorsChange = document.getElementById('colors');

  global.uiToggle = uiToggle;

  // Set up UI hide/show toggler
  uiToggle.addEventListener('click', function () {
    this.classList.toggle('active');
    if (uiContent.style.display === 'block') {
      uiContent.style.display = 'none';
      controller.style['background-color'] = '#DCDCDC';
    } else {
      uiContent.style.display = 'block';
      controller.style['background-color'] = '#D3D3D3';
    }
  });
  // Hide by default
  uiContent.style.display = 'none';

  representationSelector.addEventListener('change', (e) => {
    // make sure this hides/shows the point size slider too
    let newRepValue = Number(e.target.value);
    if (newRepValue === 3) {
      actor.getProperty().setEdgeVisibility(1);
      newRepValue = 2;
    } else {
      actor.getProperty().setEdgeVisibility(0);
    }
    actor.getProperty().setRepresentation(newRepValue);

    if (newRepValue === 0) {
      // Points rep - show the slider for point size
      pointSizeRow.style.display = 'block';
      lightingRow.style.display = 'none';
    } else {
      // hide it
      pointSizeRow.style.display = 'none';
      lightingRow.style.display = 'block';
    }

    render();
  });
  // if representationSelector is set to surface by default, then hide point slider
  if (Number(representationSelector.value) === 2) {
    pointSizeRow.style.display = 'none';
    lightingRow.style.display = 'block';
  } else {
    pointSizeRow.style.display = 'block';
    lightingRow.style.display = 'none';
  }

  pointSizeChange.addEventListener('input', (e) => {
    const pointSize = Number(e.target.value);
    actor.getProperty().setPointSize(pointSize);
    render();
  });
  actor.getProperty().setPointSize(Number(pointSizeChange.value));

  lightingChange.addEventListener('change', (e) => {
    const value = e.target.checked;
    actor.getProperty().setLighting(value);
    render();
  });
  // Make sure the lighting setting matches the toggle initial state
  lightingChange.dispatchEvent(new Event('change'));

  ambientChange.addEventListener('input', (e) => {
    const value = Number(e.target.value) / 100;
    actor.getProperty().setAmbient(value);
    render();
  });
  actor.getProperty().setAmbient(Number(ambientChange.value) / 100);

  colorsChange.addEventListener('change', (e) => {
    const value = e.target.checked;
    actor.getMapper().setScalarVisibility(value);
    if (!value) {
      lightingChange.checked = true;
      lightingChange.dispatchEvent(new Event('change'));
    }
    render();
  });
}

export default { initUserInterface };

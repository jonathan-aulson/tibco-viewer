document.getElementById('fileInput').addEventListener('change', handleFiles);

function handleFiles(event) {
  const files = event.target.files;
  for (const file of files) {
    if (file.name.endsWith('.process')) {
      const reader = new FileReader();
      reader.onload = (e) => parseProcessFile(e.target.result, file.name);
      reader.readAsText(file);
    }
  }
}

function parseProcessFile(xmlText, filename) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');

  const processName = xml.documentElement.getAttribute('name') || filename;

  const activityElems = Array.from(xml.getElementsByTagName('activity'));
  const transitionElems = Array.from(xml.getElementsByTagName('transition'));

  const activities = activityElems.map(a => ({
    name: a.getAttribute('name'),
    type: a.getAttribute('type')
  }));

  const transitions = transitionElems.map(t => ({
    from: t.getAttribute('from'),
    to: t.getAttribute('to')
  }));

  renderProcess(processName, activities, transitions);
}

function renderProcess(name, activities, transitions) {
  const steps = activities.map((a, idx) => `  ${a.name}[${a.name} (${a.type})]`).join('\n');
  const edges = transitions.map(t => `  ${t.from} --> ${t.to}`).join('\n');
  const graph = `graph TD\n${steps}\n${edges}`;

  document.getElementById('mermaidGraph').textContent = graph;
  mermaid.init(undefined, "#mermaidGraph");

  const yaml = {
    interface_name: name,
    documentation_status: "auto_generated",
    confidence_score: 1.0,
    steps: activities
  };
  document.getElementById('yamlOutput').textContent = YAML.stringify(yaml);

  const markdown = `# ${name}\n\n## Steps\n\n` + activities.map((a, i) =>
    `${i + 1}. **${a.name}** — ${a.type}`
  ).join('\n');
  document.getElementById('markdownOutput').textContent = markdown;
}

class XmlBuilder {

  static DEFAULT_OPTIONS = {
    space: '  ',
    currIndent: '',
  };

  /**
   * @param {{space: String|Number, currIndent: String}} options 
   */
  constructor(options = {}) {
    Object.assign(this, XmlBuilder.DEFAULT_OPTIONS, options);
    this.space = (typeof this.space === 'number')
      ? ' '.repeat(this.space)
      : this.space;

    this.partials = [];
  }

  /**
   * @param {String} element 
   * @param {String|Object|($: XmlBuilder) => void} attributesOrContent
   * @param {String|($: XmlBuilder) => void} content 
   */
  elem(element, attributesOrContent, content = undefined) {
    let attributes = (content !== undefined) ? attributesOrContent : '';
    content = (content === undefined) ? attributesOrContent : content;

    if (typeof attributes === 'object')
      attributes = Object.keys(attributes)
        .map(attr => `${attr.replace(/[A-Z]/g, c=>`-${c.toLowerCase()}`)}="${attributes[attr]}"`)
        .join(' ');

    if (attributes) attributes = ' ' + attributes;

    if (typeof content === 'function') {
      this.partials.push(`${this.currIndent}<${element}${attributes}>\n`);
      const innerIndent = this.currIndent + this.space;
      const innerBuilder = new XmlBuilder({space: this.space, currIndent: innerIndent});
      content(innerBuilder);
      this.partials.push(...innerBuilder.partials);
      this.partials.push(`${this.currIndent}</${element}>\n`);
    }
    else {
      this.partials.push(`${this.currIndent}<${element}${attributes}>${content}</${element}>\n`);
    }

    return this;
  }

  /**
   * @param {XmlBuilder} builder 
   */
  add(builder) {
    builder.partials
      .map(l => `${this.currIndent}${l}`)
      .forEach(l => this.partials.push(l));

    return this;
  }

  /**
   * @param {String} path 
   */
  import(path) {
    const fs = require('fs');
    let lines = fs.readFileSync(path, 'utf8').split('\n');
    
    if (lines[lines.length - 1].length === 0) 
      lines.splice(lines.length - 1, 1);

    lines.unshift(`<!-- Import: ${path} -->\n`);
    lines.push(`<!-- EndImport: ${path} -->\n`);

    lines
      .map(l => `${this.currIndent}${l}`)
      .forEach(l => this.partials.push(l));

    return this.newline();
  }


  newline() {
    this.partials.push(`${this.currIndent}\n`);
    return this;
  }

  toString() {
    return this.partials.join('');
  }

}

class SvgDiagram {

  graphs = [];
  imports = [];

  /**
   * @param {Number[]} data 
   * @param {String} color 
   */
  addGraph(data, color) {
    this.graphs.push({data, color});
  }

  /**
   * @param {String} path 
   */
  import(path) {
    this.imports.push(path);
  }

  /**
   * @param {Number} pointSize 
   * @param {{x: Number, y: Number}} scale 
   */
  generate(pointSize, scale) {
    const allData = this.graphs.reduce((allData, g) => [...allData, ...g.data], []);
    const maxDataLength = Math.max(...this.graphs.map(g => g.data.length));
    const gap = 20;
    const maxVal = Math.ceil(Math.max(...allData) / gap)*gap;
    const minVal = Math.floor(Math.min(...allData) / gap)*gap;
    const baseY = maxVal + pointSize/2;
    const width = maxDataLength * scale.x + pointSize;
    const padding = {x: 100, y: 75};

    return new XmlBuilder()
      .elem('svg', {xmlns: 'http://www.w3.org/2000/svg', fontFamily: 'Segoe UI'}, $=> {
        this.imports.forEach(path => $.import(path));
        $.add(this.$renderGrid(padding, width, pointSize, gap, baseY, minVal, scale))
        .newline()
        .add(
          this.$renderAxis(padding, baseY * scale.y, width, gap, pointSize, minVal * scale.y)
        )
        .newline()
        this.graphs.map(
          (g, id) => $.add(this.$renderGraph(id, g, padding, pointSize, baseY, scale))
        );
      }).toString();
  }

  $renderGrid({x: padX, y: padY}, width, pointSize, gap, baseY, minValue, {y: scale}) {
    const grid = new XmlBuilder();
    const textAttributes = {
      alignmentBaseline: 'central', 
      textAnchor: 'end',
      fill: '#333333',
      fontSize: '14',
      x: padX - 0.75*gap
    };
    const lineAttributes = {
      x1: padX - 0.5*gap,
      x2: padX + width,
      stroke: '#dddddd'
    };

    for (let y = padY + pointSize; y < padY + pointSize + (baseY - minValue) * scale; y += gap) {
      grid.elem('text', {...textAttributes, y}, ((baseY * scale) - (y - padY)) / scale);
      if (y === padY + baseY * scale) continue;
      grid.elem('line', {...lineAttributes, y1: y, y2: y}, '');
    }

    return grid;
  }

  $renderAxis({x: padX, y: padY}, baseY, width, gap, pointSize, minVal) {
    const xAxisAttributes = {
      x1: padX,
      x2: padX,
      strokeWidth: 1,
      stroke: '#666666'
    };
    const yAxisAttributes = {
      y1: baseY + padY,
      y2: baseY + padY,
      strokeWidth: 1,
      stroke: '#666666'
    };
    
    return new XmlBuilder()
      .elem('line', {...yAxisAttributes, x1: padX - 0.5*gap, x2: padX + width + pointSize}, '')
      .elem('line', {...xAxisAttributes, y1: padY, y2: padY + (baseY - minVal) + pointSize}, '');
  }

  $renderGraph(id, {data, color}, {x: padX, y: padY}, pointSize, baseY, {x: scaleX, y: scaleY}) {
    const graphAttributes = {
      id: `graph${id}`,
      fill: color,
      stroke: color
    };
    
    return new XmlBuilder()
      .elem('g', graphAttributes, $=> {
        data.forEach((val, idx, data) => $.add(this.$renderPoint(
          (idx - 1 < 0) ? -1 : (idx - 1) * scaleX + padX, 
          (baseY - data[idx - 1]) * scaleY + padY, 
          idx * scaleX + padX, 
          (baseY - val) * scaleY + padY, 
          val, 
          pointSize
        )));
      })
      .newline();
  }

  $renderPoint(x1, y1, x2, y2, v, r) {
    let point = new XmlBuilder();
    if (x1 >= 0) point.elem('line', {x1, y1, x2, y2}, '');

    return point
      .elem('circle', {cx: x2, cy: y2, r, strokeWidth: 0}, '')
      .elem('circle', {cx: x2, cy: y2, r: 2*r, opacity: 0}, `<title>${v}</title>`);
  }

}



const fs = require('fs');
const messreihe = fs.readFileSync('./messreihe.dat', 'utf8');
const lines = messreihe.replace(/,/g, '.').split('\n');
const data = lines.slice(1, lines.length - 1).map(parseFloat);

const dataWithoutPattern = removePattern(data, [20, 30, 40, 55, 70, 25], 2);
const dataDiffFiltered = differenzFilter(dataWithoutPattern, 90);
const dataTriangleFiltered = dreiecksFilter(dataDiffFiltered);
const dataFftFiltered = fftFilter(dataTriangleFiltered, 0.60);

const messreiheSvg = new SvgDiagram();
messreiheSvg.import('./buttons.svg');
messreiheSvg.addGraph(data, '#d85b49');
messreiheSvg.addGraph(dataWithoutPattern, '#ffffff00');
messreiheSvg.addGraph(dataDiffFiltered, '#ffffff00');
messreiheSvg.addGraph(dataTriangleFiltered, '#ffffff00');
messreiheSvg.addGraph(dataFftFiltered, '#ffffff00');
fs.writeFileSync('./messreihe.svg', messreiheSvg.generate(2, {x: 8, y: 2}), 'utf8');



function removePattern(data, pattern, rauschenProMesswert) {
  const sperrwert = 2 * pattern.length * rauschenProMesswert;
  return data.reduce((filteredData, val, idx, data) => {
    if (idx + pattern.length - 1 >= data.length) return filteredData;

    const diffSum = pattern.reduce((diffSum, _, patternIdx) => 
      diffSum + Math.abs(data[idx + patternIdx] - pattern[patternIdx]), 0);

    const idxOffset = filteredData.length - data.length;
    if (diffSum < sperrwert) filteredData.splice(idx + idxOffset, pattern.length);
    return filteredData;
  }, [...data]);
}

function differenzFilter(data, sperrwert) {
  return data.reduce((filteredData, _, idx) => {
    if (idx + 1 >= filteredData.length) return filteredData;

    const diff = filteredData[idx + 1] - filteredData[idx];
    if (Math.abs(diff) <= sperrwert) return filteredData;

    return filteredData.map((val, modifyIdx) => (modifyIdx <= idx) ? val : val - diff);
  }, data);
}

function dreiecksFilter(data) {
  const filteredData = data.map((val, idx, data) => {
    if (idx - 2 < 0 || idx + 2 >= data.length) return val;
    
    const sum = 
      data[idx-2] 
      + 2 * data[idx-1]
      + 3 * val 
      + 2 * data[idx+1] 
      + data[idx+2];

    return sum / 9;
  });

  return filteredData;
}

function fftFilter(data, frequencyDropPercentage) {
  let fftLength = data.length;
  let s = 0;
  while (fftLength > 1) {
    fftLength >>= 1;
    s++;
  }
  
  fftLength <<= ++s;
  const fftPreparedData = new Array(fftLength).fill({ampl: 0, phase: 0});
  data.forEach((v, k) => fftPreparedData[k] = {ampl: v, phase: 0});
  
  return ifft(
    fft(fftPreparedData).map((fft, idx, data) => 
      (Math.min(idx, data.length-idx) < Math.round((1 - frequencyDropPercentage) * data.length/2))
        ? fft
        : {ampl: 0, phase: 0}
    )
  ).slice(0, data.length);
}



function fft(data) {
  if (data.length <= 1) return data;

  const evenFft = fft(data.filter((_, idx) => idx % 2 === 0));
  const oddFft = fft(data.filter((_, idx) => idx % 2 !== 0));
  return evenFft.reduce((fftData, _, idx) => {
    const t1 = {
      ampl: Math.cos((-2 * Math.PI) * (idx / data.length)), 
      phase: Math.sin((-2 * Math.PI) * (idx / data.length))
    };

    const t2 = {
      ampl: t1.ampl * oddFft[idx].ampl - t1.phase * oddFft[idx].phase,
      phase: t1.ampl * oddFft[idx].phase + t1.phase * oddFft[idx].ampl
    };

    fftData[idx] = {
      ampl: evenFft[idx].ampl + t2.ampl,
      phase: evenFft[idx].phase + t2.phase
    };

    fftData[idx + data.length/2] = {
      ampl: evenFft[idx].ampl - t2.ampl,
      phase: evenFft[idx].phase - t2.phase
    };

    return fftData;
  }, new Array(data.length));
}

function ifft(fftData) {
  const invertedPhases = fftData.map(fft => ({ampl: fft.ampl, phase: -fft.phase}));
  return fft(invertedPhases).map(fft => fft.ampl *= (1 / fftData.length));
}

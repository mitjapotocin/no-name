export default class CircularSlider {
  constructor(options) {
    this.container = options.container
    this.radius = options.radius
    this.color = options.color
    this.minValue = options.minValue
    this.maxValue = options.maxValue
    this.step = options.step

    this.svgNS = 'http://www.w3.org/2000/svg'
    this.grabberDraggable = false
    this.circumference = 2 * Math.PI * this.radius
    this.range = this.maxValue - this.minValue
    this.baseStrokeColor = '#dadada'
    this.strokeWidth = 30
    this.grabberStrokeWidth = 2
    this.strokeGap = 2
    this.strokeDash = 10
    this.strokeDashCalculated =
      this.strokeDash +
      (this.circumference % (this.strokeDash + this.strokeGap)) /
        Math.floor(this.circumference / (this.strokeDash + this.strokeGap))
    this.svgSize = this.radius * 2 + this.strokeWidth + 2 * this.grabberStrokeWidth
    this.initialized = this.container.classList.contains('circular-slider-initialized')

    this.updatePosition_ = this.updatePosition.bind(this)

    this.createCircle()
  }

  createCircle() {
    this.initialized ? this.selectSvgAndUpdate() : this.initializeFirstInstance()

    this.circleWrapper = document.createElementNS(this.svgNS, 'g')
    this.baseCircle = document.createElementNS(this.svgNS, 'circle')
    this.indicatorCircle = document.createElementNS(this.svgNS, 'circle')
    this.grabber = document.createElementNS(this.svgNS, 'circle')

    this.setAttributes(this.baseCircle, {
      cx: 0,
      cy: 0,
      r: this.radius,
      stroke: this.baseStrokeColor,
      fill: 'none',
      transform: 'rotate(-90, 0, 0)',
      'stroke-width': this.strokeWidth,
      'stroke-dasharray': `${this.strokeDashCalculated} ${this.strokeGap}`,
    })

    this.setAttributes(this.indicatorCircle, {
      cx: 0,
      cy: 0,
      r: this.radius,
      stroke: this.color,
      opacity: 0.6,
      fill: 'none',
      transform: 'rotate(-90, 0, 0)',
      'stroke-width': this.strokeWidth,
      'stroke-dasharray': `0  ${this.circumference}`,
    })

    this.setAttributes(this.grabber, {
      cx: 0,
      cy: -this.radius,
      r: this.strokeWidth / 2 + this.grabberStrokeWidth / 2,
      fill: '#ffffff',
      stroke: '#cccccc',
      'stroke-width': this.grabberStrokeWidth,
    })

    this.baseCircle.addEventListener('click', this.updatePosition_)

    this.grabber.addEventListener('mousedown', () => {
      this.grabberDraggable = true

      document.addEventListener('mousemove', this.updatePosition_)
    })

    document.addEventListener('mouseup', () => {
      if (this.grabberDraggable) {
        document.removeEventListener('mousemove', this.updatePosition_)
        this.grabberDraggable = false
      }
    })

    this.circleWrapper.append(this.baseCircle, this.indicatorCircle, this.grabber)
    this.sliderSvg.append(this.circleWrapper)
  }

  updatePosition(e) {
    this.sliderSvgDimensions = this.sliderSvg.getBoundingClientRect()

    this.svgCenter = {
      x: this.sliderSvgDimensions.x + this.sliderSvgDimensions.height / 2,
      y: this.sliderSvgDimensions.y + this.sliderSvgDimensions.width / 2,
    }

    this.dx = e.pageX - this.svgCenter.x
    this.dy = e.pageY - this.svgCenter.y

    this.eventAngle = Math.atan2(this.dy, this.dx) + Math.PI / 2

    this.setAttributes(this.grabber, {
      cx: this.radius * Math.sin(this.eventAngle),
      cy: -this.radius * Math.cos(this.eventAngle),
    })
  }

  selectSvgAndUpdate() {
    this.sliderSvg = this.container.querySelector('.circular-slider-svg')

    if (this.svgSize > this.sliderSvg.getAttribute('height')) {
      this.setSvgSize()
    }
  }

  initializeFirstInstance() {
    this.sliderSvg = document.createElementNS(this.svgNS, 'svg')
    this.setSvgSize()
    this.createSliderContainers()
    this.sliderSvg.classList.add('circular-slider-svg')
    this.container.classList.add('circular-slider-container', 'circular-slider-initialized')
    this.sliderContainer.append(this.sliderSvg)
  }

  setSvgSize() {
    this.setAttributes(this.sliderSvg, {
      viewBox: `${-this.svgSize / 2} ${-this.svgSize / 2} ${this.svgSize} ${this.svgSize}`,
      width: this.svgSize,
      height: this.svgSize,
    })
  }

  createSliderContainers() {
    this.legendContainer = document.createElement('div')
    this.sliderContainer = document.createElement('div')

    this.legendContainer.classList.add('legend-container')
    this.sliderContainer.classList.add('slider-container')

    this.container.append(this.legendContainer, this.sliderContainer)
  }

  setAttributes(el, attributeAndValue) {
    Object.entries(attributeAndValue).forEach(([attribute, value]) => {
      el.setAttribute(attribute, value)
    })
  }
}

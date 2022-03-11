import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-friend-graph',
  templateUrl: './friend-graph.component.html',
  styleUrls: ['./friend-graph.component.scss'],
})



export class FriendGraphComponent implements OnInit {
  @Input() friends?: any = [];
  @Input() incoming?: any = [];
  @Input() outgoing?: any = [];
  @Input() ourPoaps?: any = [];

  ourPoapsMap = {};

  forceProperties = {
    center: {
      x: 0.5,
      y: 0.5
    },
    charge: {
      enabled: true,
      strength: -30,
      distanceMin: 1,
      distanceMax: 2000
    },
    collide: {
      enabled: true,
      strength: .7,
      iterations: 1,
      radius: 5
    },
    forceX: {
      enabled: true,
      strength: .1,
      x: 0.5
    },
    forceY: {
      enabled: true,
      strength: .1,
      y: 0.5
    },
    link: {
      enabled: true,
      distance: 30,
      iterations: 1
    }
  }

  simulation;

  svg;
  width;
  height;

  allLinksSVG;
  allNodesSVG;

  link;
  node;

  graph;

  nodesCreated = [];
  nodes = [];
  links = [];
  linkMap = {};

  initiliazed = false;
  OUR_NODE = localStorage.getItem('publickey');

  constructor() {
    
   }

  ngOnInit() {}

  ngOnChanges() {
    if (!this.initiliazed) return;
    this.createNodesAndLinks();
  }

  ngAfterViewInit() {
    this.simulation = d3.forceSimulation();

    this.svg = d3.select("svg");
    this.width = +(this.svg.node() as any).getBoundingClientRect().width;
    this.height = +(this.svg.node() as any).getBoundingClientRect().height;

    this.width = 300;
    this.height = 150;

    this.graph = { nodes: this.nodes, links: this.links};

    this.initializeDisplay();
    this.initializeSimulation();
    this.createNodesAndLinks();

    this.initiliazed = true;
  }

  createNodesAndLinks () {
    if (!this.ourPoaps) return;

    for (var k = 0; k < this.ourPoaps.length; k++) {
      this.ourPoapsMap[this.ourPoaps[k].event.id] = true;
    }

    this.createNode(this.OUR_NODE, this.ourPoaps.length + 1);

    for (var address in this.friends) {
      this.createNode(address, this.countCommonPoaps(this.friends[address].poaps) + 1);
      this.createLink(this.OUR_NODE, address, 1);
    }

    for (var address in this.incoming) {
      this.createNode(address, this.countCommonPoaps(this.incoming[address].poaps) + 1);
    }

    for (var address in this.outgoing) {
      this.createNode(address, this.countCommonPoaps(this.outgoing[address].poaps) + 1);
    }

    this.updateGraph();
  }

  countCommonPoaps (poaps) {
    var sum = 0;

    for (var k = 0; k < poaps.length; k++) {
      if (this.ourPoapsMap[poaps[k].event.id]) sum++;
    }

    return sum;
  }

  ionViewWillEnter() {
    
  }

  // Don't forget to call updateGraph
  createNode (node, size) {
    if (this.nodesCreated[node]) return;
    this.nodesCreated[node] = true;
    
    var datanode = { id: node, group: 1, x: 500, y: 500, size: size};
    this.nodes.push(datanode);
  }
  
  // Don't forget to call updateGraph
  createLink (n1, n2, weight) {
    if (n1 < n2) {
      var temp = n2;
      n2 = n1;
      n1 = temp;
    }
    
    if (!this.linkMap[n1]) this.linkMap[n1] = {};
    if (this.linkMap[n1][n2]) return false;
    
    this.linkMap[n1][n2] = true;
    var datalink = { source: n1, target: n2, value: weight };
    this.links.push(datalink);
    
    return true;
  }

  updateGraph () {
    this.graph = { nodes: this.nodes, links: this.links };
    this.simulation.nodes(this.graph.nodes);
    this.simulation.alpha(Math.max(this.simulation.alpha(),0.05)).restart();
    
    this.allNodesSVG.selectAll("circle").data(this.nodes).enter().append("circle").call(d3.drag()
    .on("start", this.dragstarted.bind(this))
    .on("drag", this.dragged.bind(this))
    .on("end", this.dragended.bind(this)))
    .append("title")
    .text(function(d) { return d.id; });
              
    this.allLinksSVG.selectAll("line").data(this.links).enter().append("line");
    
    this.updateDisplay();
  }

  initializeSimulation() {
    this.simulation.nodes(this.graph.nodes);
    this.initializeForces();
    this.simulation.on("tick", this.ticked.bind(this));
  }

  initializeForces() {
    // add forces and associate each with a name
    this.simulation
      .force("link", d3.forceLink())
      .force("charge", d3.forceManyBody())
      .force("collide", d3.forceCollide())
      .force("center", d3.forceCenter())
      .force("forceX", d3.forceX())
      .force("forceY", d3.forceY());
    // apply properties to each of the forces
    this.updateForces();
}

  updateForces() {
    // get each force by name and update the properties
    this.simulation.force("center")
      .x(this.width * this.forceProperties.center.x)
      .y(this.height * this.forceProperties.center.y);
    this.simulation.force("charge")
      .strength(this.forceProperties.charge.strength * +this.forceProperties.charge.enabled)
      .distanceMin(this.forceProperties.charge.distanceMin)
      .distanceMax(this.forceProperties.charge.distanceMax);
    this.simulation.force("collide")
      .strength(this.forceProperties.collide.strength * +this.forceProperties.collide.enabled)
      .radius(this.forceProperties.collide.radius)
      .iterations(this.forceProperties.collide.iterations);
    this.simulation.force("forceX")
      .strength(this.forceProperties.forceX.strength * +this.forceProperties.forceX.enabled)
      .x(this.width * this.forceProperties.forceX.x);
    this.simulation.force("forceY")
      .strength(this.forceProperties.forceY.strength * +this.forceProperties.forceY.enabled)
      .y(this.height * this.forceProperties.forceY.y);
    this.simulation.force("link")
      .id(function(d) {return d.id;})
      .distance(this.forceProperties.link.distance)
      .iterations(this.forceProperties.link.iterations)
      .links(this.forceProperties.link.enabled ? this.graph.links : []);

      console.log(this.forceProperties.forceX.strength * +this.forceProperties.forceX.enabled, this.width * this.forceProperties.forceX.x);

    // updates ignored until this is run
    // restarts the simulation (important if simulation has already slowed down)
    this.simulation.alpha(1).restart();
  }

  initializeDisplay() {
    this.allLinksSVG = this.svg.append("g").attr("class", "links");
    this.allNodesSVG = this.svg.append("g").attr("class", "nodes");
    
    // set the data and properties of link lines
    this.allLinksSVG
      .selectAll("line")
      .data(this.graph.links)
      .enter().append("line");
  
    // set the data and properties of node circles
    this.allNodesSVG
      .selectAll("circle")
      .data(this.graph.nodes)
      .enter().append("circle")
          .call(d3.drag()
              .on("start", this.dragstarted.bind(this))
              .on("drag", this.dragged.bind(this))
              .on("end", this.dragended.bind(this)))
      .append("title")
        .text(function(d) { return d.id; });;

    // visualize the graph
    this.updateDisplay();
  }

  updateDisplay() {
    this.allNodesSVG
    .selectAll("circle")
        .attr("r", function (d) { return this.forceProperties.collide.radius + Math.log(d.size) * 2; }.bind(this))
        .attr("stroke", function (d) { return (d.id === this.OUR_NODE) ? "#8076fa" : "grey" }.bind(this))
        .attr("stroke-width", this.forceProperties.charge.enabled==false ? 0 : Math.abs(this.forceProperties.charge.strength)/15)

    this.allLinksSVG
    .selectAll("line")
        .attr("stroke-width", this.forceProperties.link.enabled ? 1 : .5)
        .attr("opacity", this.forceProperties.link.enabled ? 1 : 0)
        .attr("stroke", "#aaa");
  }

  ticked() {
    this.allLinksSVG
    .selectAll("line")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    this.allNodesSVG
    .selectAll("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    d3.select('#alpha_value').style('flex-basis', (this.simulation.alpha()*100) + '%');
  }
  
  //////////// UI EVENTS ////////////
  dragstarted(d) {
    if (!(d3 as any).event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(d) {
    d.fx = (d3 as any).event.x;
    d.fy = (d3 as any).event.y;
  }

  dragended(d) {
    if (!(d3 as any).event.active) this.simulation.alphaTarget(0.0001);
    d.fx = null;
    d.fy = null;
  }
  
}

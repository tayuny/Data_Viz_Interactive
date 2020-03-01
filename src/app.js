const domReady = require('domready');
import {select} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import {geo} from 'd3-geo';
import "d3-array";
import * as d3 from "d3";
import './stylesheets/main.css';

console.log("hello world")

const count = 0;

domReady(() => {
    Promise.all([
      csv('./data/perc.csv')
    ]).then(d => {
      plot_choropleth("TotalValue", count);
      tract_info(d[0]);
    });
});

function render(val, count) {
  // remove old contents
  //select('.map_part *').remove();
  //select('.line-part *').remove();
  select('body').selectAll("svg").remove();
  plot_choropleth(val, count);
  // start doing stuff
  };

function app(data){

};

function tract_info(data){

  const x_arr = data.reduce((el, r) => el.concat(r.percentile), []);
  const y_arr = data.reduce((el, r) => el.concat(r.COM_value), []);

  const max_xarr = d3.max(x_arr);
  const min_xarr = d3.min(x_arr);
  const max_yarr = d3.max(y_arr);
  const min_yarr = d3.min(y_arr);

  const margin = {top: 60, left: 80, right: 80, bottom: 60};
  const height = 500
  const width = 500
  const axisLabelOffset = 30;

  const svg = select("body")
             .append("svg")
             .attr("class", "line-part")
             .attr("height", height)
             .attr("width", width);
  
  const pwidth = width - margin.left - margin.right;
  const pheight = height - margin.bottom - margin.top;
  
  const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)
  
  const x = d3.scaleLinear()
              .domain([min_xarr, max_xarr])
              .range([0, pwidth])
              .nice();
  
  const y = d3.scaleLinear()
              .domain([min_yarr, max_yarr])
              .range([pheight, 0])
              .nice();
  
  const xAxis = g => g.attr("transform", `translate(0, ${pheight})`)
                      .call(d3.axisBottom(x));
  
  const yAxis = g => g.attr("transform", "translate(0,0)")
                      .call(d3.axisLeft(y));
  
  g.append("g").call(xAxis);
  g.append("g").call(yAxis);

  const line = d3.line()
                 .x(function(d) {return x(d.percentile);})
                 .y(function(d) {return y(d.RES_value/ 10);})
                 .curve(d3.curveMonotoneX)
  
  const line2 = d3.line()
                 .x(function(d) {return x(d.percentile);})
                 .y(function(d) {return y(d.COM_value/ 10);})
                 .curve(d3.curveMonotoneX)
  
  g.selectAll("dot")
   .data(data)
   .enter()
   .append("circle")
   .attr("cx", function(d){return x(d.percentile);})
   .attr("cy", function(d){return y(d.RES_value / 10);})
   .attr("r", 5)
   .attr("fill", "#4446b8")
   .on("mouseenter", function(d) {
       d3.select(this).attr("fill", "white")
                      .attr("r", 10)
                      .attr("stroke", "#4446b8");
       })
    .on("mouseleave", function(d) {
        d3.select(this).attr("fill", "#4446b8")
                       .attr("r", 5);
      });;

   g.selectAll("dot")
   .data(data)
   .enter()
   .append("circle")
   .attr("cx", function(d){return x(d.percentile);})
   .attr("cy", function(d){return y(d.COM_value/ 10);})
   .attr("r", 5)
   .attr("fill", "orange")
   .on("mouseenter", function(d) {
    d3.select(this).attr("fill", "white")
                   .attr("r", 10)
                   .attr("stroke", "orange")
                   //.text("percentile: " + String(d.percentile) + "  ,  Property Value: " + String(d.COM_value / 10));
    })
    .on("mouseleave", function(d) {
      d3.select(this).attr("fill", "orange")
                     .attr("r", 5);
    });
                
  g.append("path")
     .datum(data)
     .attr("class", "line")
     .attr("d", line)
     .attr("stroke", "blue")
     .style("fill", "none");
  
  g.append("path")
     .datum(data)
     .attr("class", "line2")
     .attr("d", line2)
     .attr("stroke", "orange")
     .style("fill", "none");

};

function plot_choropleth(val, count){
  var width = 900;
  var height = 500;

  const div = select('.main-area')
              .append('div')
              .attr('class', 'flex-down');
  
  if (count <= 1){
    const dropDown = div.append('select')
                        .on('change', function dropdownReaction(d) {
                             const val = this.value;
                             const count = count + 1
                             render(val, count);
                        });

    dropDown.selectAll('option')
            .data(['TotalValue', 'median_income', "SQFTmain", "Travel_Time701902"])
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);
  }

    var svg = d3.select("body")
                .append("svg")
                .attr("class", "map_part")
                .attr("width", width)  
                .attr("height", height);

  d3.json('./data/full_sub_CL701902_part.geojson').then(function(data) {

      var scale = 300000;
      var offset = [width/4, height/2];

      var projection = d3.geoEquirectangular()
                         .scale(scale)
                         .center([-118.494248, 34.017235])
                         .translate(offset);

      var geopath = d3.geoPath().projection(projection);
    
      const features = data.features
      const color_dom = features.reduce((el, r) => el.concat(r.properties[val]), []);
      const color_min = d3.min(color_dom);
      const color_max = d3.max(color_dom);

      const color = d3.scaleSequential()
			  		          .domain([color_min, color_max])
                      .interpolator(d3.interpolateYlGnBu);

      svg.append("g")
         .selectAll('path')
         .data(data.features)
         .enter()
         .append('path')
         .attr("fill", function(d){return color(d.properties[val]);})
         .attr('d', geopath)
         .attr("stroke", "black")
         .on("mouseenter", function(d) {
            d3.select(this).attr("fill", "orange");
          })
         .on("mouseleave", function(d) {
            d3.select(this)
              .attr("fill", function(d){return color(d.properties[val]);})}
          );
  });
}
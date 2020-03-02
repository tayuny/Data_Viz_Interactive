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

  select('body').selectAll("svg").remove();
  plot_choropleth(val, count);

};

function app(data){};

function tract_info(data){

  const margin = {top: 60, left: 100, right: 100, bottom: 60};
  const height = 600
  const width = 500
  
  const svg = select("body")
             .append("svg")
             .attr("class", "line-part")
             .attr("height", height)
             .attr("width", width);

  svg.append("text")
     .attr("x", (width -margin.left-margin.right) / 3)
     .attr("y", margin.top/3)
     .text("Property Value for Commercial and Residential Building")
     .style("font-size", "14px")
     .attr("alignment-baseline","middle")
  
  svg.append("text")
     .attr("x", (width -margin.left-margin.right) / 3)
     .attr("y", (margin.top/3) + 15)
     .text("in Each Percentile, the property values have unit of $1000")
     .style("font-size", "14px")
     .attr("alignment-baseline","middle")
  
  svg.append("text")
     .attr("x", (width -margin.right))
     .attr("y", height - 20)
     .text("Percentile")
     .style("font-size", "12px")
     .attr("alignment-baseline","middle")
  
  svg.append("text")
     .attr("x", margin.left / 10)
     .attr("y", margin.top + 20)
     .text("Property")
     .style("font-size", "12px")
     .attr("alignment-baseline","middle")
  
     svg.append("text")
     .attr("x", margin.left / 10)
     .attr("y", margin.top + 35)
     .text("Values")
     .style("font-size", "12px")
     .attr("alignment-baseline","middle")

  const x_arr = data.reduce((el, r) => el.concat(r.percentile), []);
  const y_arr = data.reduce((el, r) => el.concat(r.COM_value), []);

  const max_xarr = d3.max(x_arr);
  const min_xarr = d3.min(x_arr);
  const max_yarr = d3.max(y_arr);
  const min_yarr = d3.min(y_arr);
  
  const pwidth = width - margin.left - margin.right;
  const pheight = height - margin.bottom - margin.top;
  
  const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)
  
  const x = d3.scaleLinear()
              .domain([min_xarr, max_xarr])
              .range([0, pwidth])
              .nice();
  
  const y = d3.scaleLinear()
              .domain([min_yarr/100 , max_yarr / 100])
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
                 .y(function(d) {return y(d.RES_value/ 1000);})
                 .curve(d3.curveMonotoneX)
  
  const line2 = d3.line()
                 .x(function(d) {return x(d.percentile);})
                 .y(function(d) {return y(d.COM_value/ 1000);})
                 .curve(d3.curveMonotoneX)
  
  g.selectAll("dot")
   .data(data)
   .enter()
   .append("circle")
   .attr("cx", function(d){return x(d.percentile);})
   .attr("cy", function(d){return y(d.RES_value / 1000);})
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
   .attr("cy", function(d){return y(d.COM_value/ 1000);})
   .attr("r", 5)
   .attr("fill", "orange")
   .on("mouseenter", function(d) {
    d3.select(this).attr("fill", "white")
                   .attr("r", 10)
                   .attr("stroke", "orange")
                   //.text("percentile: " + String(d.percentile) + 
                   //"  ,  Property Value: " + String(d.COM_value / 10));
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

  svg.append("circle").attr("cx",width-margin.right).attr("cy", height - 2*margin.top).attr("r", 6).style("fill", "orange")
  svg.append("circle").attr("cx",width-margin.right).attr("cy", height - 2*margin.top + 20).attr("r", 6).style("fill", "#4446b8")
  svg.append("text").attr("x", width-margin.right+10).attr("y", height - 2*margin.top).text("Commercial").style("font-size", "12px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", width-margin.right+10).attr("y", height - 2*margin.top + 20).text("Residential").style("font-size", "12px").attr("alignment-baseline","middle")
};

function plot_choropleth(val, count){
  var width = 900;
  var height = 600;
  const margin = {top: 60, left: 100, right: 100, bottom: 60};

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

    svg.append("text").attr("x", (width -margin.left-margin.right) / 3).attr("y", margin.top/5)
       .text("Choropleth Showing Neighborhood Attributes").style("font-size", "18px")
       .attr("alignment-baseline","middle");
    
    svg.append("text").attr("x", (width -margin.left-margin.right) / 3).attr("y", (margin.top/5) + 20)
       .text("selection between total property value, median income").style("font-size", "14px")
       .attr("alignment-baseline","middle");
    
    svg.append("text").attr("x", ((width -margin.left-margin.right) / 3) - 10).attr("y", (margin.top/5) + 40)
       .text("square footage of buildings and distance to commercial district").style("font-size", "14px")
       .attr("alignment-baseline","middle")

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
                      .interpolator(d3.interpolateBlues);
      
      const q_idx = [0.2, 0.4, 0.6, 0.8]
      const val_quan = q_idx.reduce((el, r) => el.concat(Math.ceil(d3.quantile(color_dom, r))), []);
      
      const legend_x = width - margin.right;
      const legend_y = height - 3 * margin.bottom - 60;
      const legend_gap = 15;
      const legend = svg.selectAll("rect")
		                    .data(val_quan.sort((a, b) => b - a))
		                    .enter()
		                    .append("rect")
		                    .attr("width", 12)
				                .attr("height", 12)
				                .attr("x", legend_x)
				                .attr("y", function(d, i){return legend_y + legend_gap * i;})
                        .attr("fill", function(d){return color(d);});
    
      const text_x = legend_x + 15
      const text_y = legend_y + 10
      const text_gap = legend_gap
      const legend_text = svg.selectAll("legend_text")
                             .data(val_quan.sort((a, b) => b - a))
                             .enter()
                             .append("text")
                             .text( function(d){ return d;} )
                             .attr("font-size", 14)
                             .attr("x", text_x)
                             .attr("y", function(d, i){return text_y + text_gap * i;});

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
      
      svg.append("text").attr("x", width / 10)
          .attr("y", (height / 2) + 40).text("Commercial").style("font-size", "14px")
          .attr("alignment-baseline","middle").attr("fill", "black");
         
      svg.append("text").attr("x", (width / 10) + 30)
          .attr("y", (height / 2) + 55).text("District").style("font-size", "14px")
          .attr("alignment-baseline","middle").attr("fill", "black");
  });
}
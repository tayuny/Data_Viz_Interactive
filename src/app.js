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
      LA_bivariate();
      article_insert();
      plot_choropleth("TotalValue", count);
      ridge("SM", "", "2");
      tract_info(d[0], "2");
    });
});

function render(val, count, operation, CT_ind) {

  if (operation == "switch_var"){
    select('body').selectAll(".map_part").remove();
    select('body').selectAll(".line-part2").remove();
    select('body').selectAll(".ridge-part2").remove();
    select('body').selectAll(".switch_bar").remove();
    plot_choropleth(val, count);
    csv('./data/perc.csv').then(d => {tract_info(d, "2");});
    ridge("SM", "", "2");
   }
  else{
     select('body').selectAll(".line-part2").remove();
     react_line(CT_ind);
     select('body').selectAll(".ridge-part2").remove();
     ridge("yes", CT_ind, "2");
   }
};

function app(data){};

function tract_info(data, chartnum){

  const margin = {top: 60, left: 100, right: 100, bottom: 60};
  const height = 500
  const width = 450
  
  const svg = select("body")
             .append("svg")
             .attr("class", "line-part" + chartnum)
             .attr("height", height)
             .attr("width", width);

  svg.append("text")
     .attr("x", (width - margin.left-margin.right) / 3)
     .attr("y", margin.top/3)
     .text("Property Value for Commercial and Residential ")
     .style("font-size", "14px")
     .attr("alignment-baseline","middle")
  
  svg.append("text")
     .attr("x", ((width -margin.left-margin.right) / 3) + 73)
     .attr("y", (margin.top/3) + 15)
     .text("Building in Each Percentile")
     .style("font-size", "14px")
     .attr("alignment-baseline","middle")

  svg.append("text")
     .attr("x", ((width -margin.left-margin.right) / 3) + 50)
     .attr("y", (margin.top/3) + 30)
     .text("the property values have unit of $1,000")
     .style("font-size", "12px")
  
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

  const max_xarr = d3.max(x_arr.sort((a, b) => a - b));
  const min_xarr = d3.min(x_arr.sort((a, b) => a - b));
  const max_yarr = d3.max(y_arr.sort((a, b) => a - b));
  const min_yarr = d3.min(y_arr.sort((a, b) => a - b));
  
  const pwidth = width - margin.left - margin.right;
  const pheight = height - margin.bottom - margin.top;
  
  const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)
  
  const x = d3.scaleLinear()
              .domain([min_xarr, max_xarr])
              .range([0, pwidth])
              .nice();
  
  const y = d3.scaleLinear()
              .domain([0 , max_yarr / 100])
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
  
  svg.append("text").attr("x", 105).attr("y", 100).text("Percentile: ").attr("font-size", 12);
  svg.append("text").attr("x", 105).attr("y", 115).text("Property Type: ").attr("font-size", 12);
  svg.append("text").attr("x", 105).attr("y", 130).text("Property Value: ").attr("font-size", 12);
  //svg.append("text").attr("class", "perc_info").attr("x", 200).attr("y", 130).text((d3.median(y_arr) / 1000) + " (median)").attr("font-size", 12);


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
       select("body").selectAll(".perc_info").remove();

       svg.append("text").attr("class", "perc_info").attr("x", 175).attr("y", 100).text(d.percentile).attr("font-size", 12);
       svg.append("text").attr("class", "perc_info").attr("x", 200).attr("y", 115).text("residential").attr("font-size", 12);
       svg.append("text").attr("class", "perc_info").attr("x", 205).attr("y", 130).text(d.RES_value / 1000).attr("font-size", 12);
       })
    .on("mouseleave", function(d) {
        d3.select(this).attr("fill", "#4446b8")
                       .attr("r", 5);
        select("body").selectAll(".perc_info").remove();
        //svg.append("text").attr("class", "perc_info").attr("x", 200).attr("y", 130).text(d3.median(y_arr) + "(median)").attr("font-size", 12);
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
      svg.append("text").attr("class", "perc_info").attr("x", 175).attr("y", 100).text(d.percentile).attr("font-size", 12);
      svg.append("text").attr("class", "perc_info").attr("x", 200).attr("y", 115).text("commercial").attr("font-size", 12);
      svg.append("text").attr("class", "perc_info").attr("x", 205).attr("y", 130).text(d.COM_value / 1000).attr("font-size", 12);
    })
    .on("mouseleave", function(d) {
      d3.select(this).attr("fill", "orange")
                     .attr("r", 5);
      select("body").selectAll(".perc_info").remove();
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
   var width = 600;
   var height = 500;
   const margin = {top: 60, left: 100, right: 100, bottom: 60};

   const div = select('body')
              .append('div')
              .attr('class', 'flex-down');

   var svg = d3.select("body")
                .append("svg")
                .attr("class", "map_part")
                .attr("width", width)  
                .attr("height", height);
  
   const buttom_text = ["(Please Select Your Variable)",
                       "Median Property Value ($)", "Median Income ($)", 
                       "Median Square Footage of Buildings (square foot)",
                       "Traveling Time to Commercial District (second)"]
   const buttom_val = ["TotalValue", "TotalValue", "median_income", "SQFTmain", "Travel_Time701902"]
   const val_rel = {"TotalValue":"Median Property Value ($)", "median_income":"Median Income ($)", 
                    "SQFTmain":"Median Square Footage of Buildings (square foot)", 
                    "Travel_Time701902":"Traveling Time to Commercial District (second)"}

   const dropDown = div.append('select')
                        .attr("class", "switch_bar")
                        .on('change', function dropdownReaction(d) {
                            const val = this.value;
                            const count = count + 1
                        render(val, count, "switch_var", "");
                          });

   dropDown.selectAll('option')
           .data(buttom_val)
           .enter()
           .append('option')
           .attr('value', d => d)
           .text(function(d, i){return buttom_text[i]});
    
    svg.append("text").attr("x", 30).attr("y", 400).attr("fill", "black").text("Current Selected Variable: ")
       .attr("font-weight", "bold").attr("font-size", 14)
    svg.append("text").attr("x", 245).attr("y", 400).attr("fill", "black").text(val_rel[val])
       .attr("font-weight", "bold").attr("font-size", 14)
   
    svg.append("text").attr("x", 30).attr("y", 420).attr("fill", "black").text("The Value of the selected variable in the selected region is: ")
       .attr("font-weight", "bold").attr("font-size", 10)

    svg.append("text").attr("x", ((width -margin.left-margin.right) / 3) + 30).attr("y", margin.top/5)
       .text("Choropleth Showing Neighborhood Attributes").style("font-size", "18px")
       .attr("alignment-baseline","middle");
    
    svg.append("text").attr("x", ((width -margin.left-margin.right) / 3) + 70).attr("y", (margin.top/5) + 20)
       .text("selection between total property value, median income").style("font-size", "12px")
       .attr("alignment-baseline","middle");
    
    svg.append("text").attr("x", ((width -margin.left-margin.right) / 3) + 42).attr("y", (margin.top/5) + 35)
       .text("square footage of buildings and distance to commercial district").style("font-size", "12px")
       .attr("alignment-baseline","middle")

  d3.json('./data/full_sub_CL701902_part.geojson').then(function(data) {

      var scale = 250000;
      var offset = [width/4, height/2];

      var projection = d3.geoEquirectangular()
                         .scale(scale)
                         .center([-118.494248, 34.019235])
                         .translate(offset);

      var geopath = d3.geoPath().projection(projection);
    
      const features = data.features
      const color_dom = features.reduce((el, r) => el.concat(r.properties[val]), []);
      const color_min = d3.min(color_dom);
      const color_max = d3.max(color_dom);

      svg.append("text").attr("class", "local-info")
                .attr("x", 370).attr("y", 420).attr("fill", "black").text("(entire Santa Monica) " + d3.median(color_dom))
                .attr("font-weight", "bold").attr("font-size", 10);

      const color = d3.scaleSequential()
			  		       .domain([color_min, color_max])
                      .interpolator(d3.interpolateBlues);
      
      const q_idx = [0.2, 0.4, 0.6, 0.8]
      const val_quan = q_idx.reduce((el, r) => el.concat(Math.ceil(d3.quantile(color_dom, r))), []);
      
      const legend_x = width - margin.right + 15;
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
              .attr("fill", function(d){return color(d.properties[val]);})
           })
          .on("click", function(d){
             render(d, 0, "click", d.properties["CT"]);
             select("body").selectAll(".local-info").remove();
             svg.append("text").attr("class", "local-info")
                .attr("x", 370).attr("y", 420).attr("fill", "black").text(d.properties[val])
                .attr("font-weight", "bold").attr("font-size", 10);
            });
      
      svg.append("text").attr("x", (width / 10) - 35)
          .attr("y", (height / 2) + 45).text("Commercial").style("font-size", "14px")
          .attr("alignment-baseline","middle").attr("fill", "black");
         
      svg.append("text").attr("x", (width / 10))
          .attr("y", (height / 2) + 60).text("District").style("font-size", "14px")
          .attr("alignment-baseline","middle").attr("fill", "black");

      svg.selectAll("instru1")
         .data(["Select the Variable", "for the Map Here"])
         .enter()
         .append("text")
         .text(function(d){return d;})
         .style("font-size", "14px")
         .style("font-weight", "bold")
         .attr("fill", "blue")
         .attr("x", 0)
         .attr("y", function(d, i){return 15 + 15 * i;});

      svg.append("text")
         .text("Click on the Map to Select the Region")
         .style("font-size", "14px")
         .style("font-weight", "bold")
         .attr("fill", "blue")
         .attr("x", 220)
         .attr("y", 80);
  });
}


function react_line(CT_ind){

   const sub_data = []
   d3.csv('./data/percCT.csv').then(function(data){
     for (let i = 0; i < data.length; i++){if (data[i].CT == CT_ind){
        sub_data.push(data[i])
     }
   }
   select("body").selectAll("svg.line-part").remove();
   tract_info(sub_data, "2")
   });
}


// The function is the modified version of the source code of the following
//##########################################################################
// Source: Ridgeline plot template in d3.js (D3.js Graph Gallery)
// URL: https://www.d3-graph-gallery.com/graph/ridgeline_template.html
// Author: Andrew Mollica
// Date: 2018
//##########################################################################
function ridge(regional, CTind, plotnum){

  const margin = {top: 60, left: 100, right: 100, bottom: 60};
  const height = 500
  const width = 450
  
  const svg = select("body")
             .append("svg")
             .attr("class", "ridge-part" + plotnum)
             .attr("align", "right")
             .attr("height", height)
             .attr("width", width);

   const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)
   
   var dirc = ""
   if (regional === "SM"){dirc = './data/yearly_plot2.csv'
   }else if (regional === "CL"){dirc = './data/LA_summary_ridge.csv'
   }else{dirc = './data/yearly_plot3.csv'}

   d3.csv(dirc).then(function(data){

   var sub_data = [] 
   if ((regional != "SM") && (regional != "CL")){
      for (let i = 0; i < data.length; i++){if (data[i].CT == CTind){
         sub_data.push(data[i])
         }
      }
      var data = sub_data
   }

   var pwidth = width - margin.left - margin.right;
   const pheight = height - margin.bottom - margin.top;

   var categories = ["PropertyValue2014", "PropertyValue2015", "PropertyValue2016", "PropertyValue2017", "PropertyValue2018"]
   var n = categories.length
   
   var x_arr = data.reduce((el, r) => el.concat(r.PropertyValue2018), []);
   var max_xarr = d3.max(x_arr.sort((a, b) => a - b));
   var min_xarr = d3.min(x_arr.sort((a, b) => a - b));

   if(CTind === 701902){
      max_xarr = d3.quantile(x_arr.sort((a, b) => a - b), 0.99);
   }

    // Add X axis
    var x = d3.scaleLinear()
              .domain([0, max_xarr])
              .range([0, pwidth])
              .nice();

    g.append("g")
     .attr("transform", "translate(0," + pheight + ")")
     .call(d3.axisBottom(x));

    // Create a Y scale for densities
    var y = d3.scaleLinear()
              .domain([0, 0.25])
              .range([pheight, 0])
              .nice();

    var yYear = d3.scaleBand()
                  .domain(categories)
                  .range([margin.top * 2, pheight])
                  .paddingInner(1)

    g.append("g")
     .call(d3.axisLeft(yYear));

    var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40))
    var allDensity = []
    for (let i = 0; i < n; i++){
      var key = categories[i]
      var density = kde( data.map(function(d){  return d[key]; }) )
      allDensity.push({key: key, density: density})
    };
    
    var medians = []
    for (let i = 0; i < n; i++){
      var year_data = data.reduce((el, r) => el.concat(r[categories[i]]), [])
      medians.push(d3.median(year_data))
    }

    var color_min = d3.min(medians);
    var color_max = d3.max(medians);
    var color = d3.scaleSequential()
                    //.domain([color_min, color_max])
                    .domain([color_max, color_min])
                    .interpolator(d3.interpolateCividis);
    var q_idx = [0, 0.25, 0.5, 0.75, 1]
    var val_quan = q_idx.reduce((el, r) => el.concat(Math.ceil(d3.quantile(medians, r))), []);

    g.selectAll("areas")
       .data(allDensity)
       .enter()
       .append("path")
       .attr("transform", function(d){return("translate(0," + (yYear(d.key)-pheight) +")" )})
       .attr("fill", function(d){
         var grp = d.key;
         var index = categories.indexOf(grp)
         var value = medians[index]
         return color(value)
       })
       .datum(function(d){return(d.density)})
       .attr("stroke", "#000")
       .attr("stroke-width", 1)
       .attr("d",  d3.line().curve(d3.curveBasis)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
      )
   
   const legend_x = width - margin.right + 20;
   const legend_y = height - 2 * margin.bottom;
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

   svg.append("text").text("Median").attr("x", legend_x).attr("y", legend_y - 50);
   svg.append("text").text("Property").attr("x", legend_x).attr("y", legend_y - 35);
   svg.append("text").text("Value").attr("x", legend_x).attr("y", legend_y - 20);
   svg.append("text").text("($10,000)").attr("x", legend_x).attr("y", legend_y - 5);

   svg.append("text")
     .attr("x", (width - margin.left-margin.right) / 4)
     .attr("y", margin.top/3)
     .text("Property Value Distribution From 2014 - 2018")
     .style("font-size", "14px")
     .attr("alignment-baseline","middle")
   
   svg.append("text")
     .attr("x", ((width -margin.left-margin.right) / 4) - 10)
     .attr("y", (margin.top/3) + 15)
     .text("The color represents the median value of the distribution")
     .style("font-size", "12px")
     .attr("alignment-baseline","middle")
  });
};

function kernelDensityEstimator(kernel, X) {
   return function(V) {
     return X.map(function(x) {
       return [x, d3.mean(V, function(v) { return kernel(x - v); })];
     });
   };
 }
 function kernelEpanechnikov(k) {
   return function(v) {
     return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
   };
 }


function LA_bivariate(){
   
   var width = 1500;
   var height = 800;
   const margin = {top: 60, left: 100, right: 100, bottom: 60};

   var svg = d3.select("body")
               .append("svg")
               .attr("class", "map_part2")
               .attr("width", width)
               .attr("height", height);
   
   svg.append("text").text("Bivariate Choropleth for Property Value").attr("x", 20).attr("y", 110).style("font-size", "20px")
   svg.append("text").text("and Building Square Footage in LA").attr("x", 45).attr("y", 135).style("font-size", "20px")
   svg.append("text").text("properties in the sub-urban regions in LA have both higher building").attr("x", 20).attr("y", 160).style("font-size", "12px")
   svg.append("text").text("square footage and property values. Suburbanization effect remains").attr("x", 20).attr("y", 175).style("font-size", "12px")
   svg.append("text").text("in Greater Los Angeles Region").attr("x", 142.5).attr("y", 190).style("font-size", "12px")
   d3.json('./data/plot_geo.geojson').then(function(data){

      var scale = 50000;
      var offset = [width/4, height/2];

      var projection = d3.geoEquirectangular()
                         .scale(scale)
                         .center([-118.72, 34.02])
                         .translate(offset);

      var geopath = d3.geoPath().projection(projection);
      const features = data.features;

      var x_arr = features.reduce((el, r) => el.concat(r.properties["TotalValue"]), []);
      var max_xarr = d3.max(x_arr.sort((a, b) => a - b));
      var min_xarr = d3.min(x_arr.sort((a, b) => a - b));

      var y_arr = features.reduce((el, r) => el.concat(r.properties["SQFTmain"]), []);
      var max_yarr = d3.max(y_arr.sort((a, b) => a - b));
      var min_yarr = d3.min(y_arr.sort((a, b) => a - b));
      
      // The color part of the function is the modified version of the source code of the following
      //###########################################################################################
      // Source: Bivariate Choropleth (Observable)
      // URL: https://observablehq.com/@d3/bivariate-choropleth
      // Author: Mike Bostock
      // Date: 2019
      //###########################################################################################
      //var colors = ["#e8e8e8", "#e4acac", "#c85a5a", "#b0d5df", "#ad9ea5", "#985356", "#64acbe", "#627f8c", "#574249"]
      //var colors = ["#e8e8e8", "#ace4e4", "#5ac8c8", "#dfb0d6", "#a5add3", "#5698b9", "#be64ac", "#8c62aa", "#3b4994"]
      //var colors = ["#e8e8e8", "#e4d9ac", "#c8b35a", "#cbb8d7", "#c8ada0", "#af8e53", "#9972af", "#976b82", "#804d36"]
      var colors = ["#e8e8e8", "#b5c0da", "#6c83b5", "#b8d6be", "#90b2b3", "#567994", "#73ae80", "#5a9178", "#2a5a5b"]

      var n = 3
      var x = d3.scaleQuantile(x_arr, d3.range(n));
      var y = d3.scaleQuantile(y_arr, d3.range(n));
      function bi_color(a, b){return colors[y(b) + x(a) * n];};
      
      svg.append("g")
         .selectAll('path')
         .data(data.features)
         .enter()
         .append('path')
         .attr("fill", function(d){return bi_color(d.properties["TotalValue"], d.properties["SQFTmain"]);})
         .attr('d', geopath)
         .attr("stroke", "black");

      // Adding Legends
      var legend_x = 1300;
      const legend_y = height - 3 * margin.bottom - 60;
      const legend_gap = 40;

      svg.selectAll("rect")
         .data(colors.slice(0, 3))
         .enter()
         .append("rect")
         .attr("width", 40)
         .attr("height", 40)
         .attr("x", 1300)
         .attr("y", function(d, i){return legend_y + legend_gap * i;})
         .attr("fill", function(d){return d;});

      var legend_x = 1340;
      svg.selectAll("rect2")
         .data(colors.slice(3, 6))
         .enter()
         .append("rect")
         .attr("width", 40)
         .attr("height", 40)
         .attr("x", 1340)
         .attr("y", function(d, i){return legend_y + legend_gap * i;})
         .attr("fill", function(d){return d;});

      var legend_x = 1380;
      svg.selectAll("rect3")
         .data(colors.slice(6, 9))
         .enter()
         .append("rect")
         .attr("width", 40)
         .attr("height", 40)
         .attr("x", 1380)
         .attr("y", function(d, i){return legend_y + legend_gap * i;})
         .attr("fill", function(d){return d;});
      
      svg.append("text")
         .text("low  median  high")
         .style("font-size", "14px")
         .attr("x", 1300)
         .attr("y", function(d, i){return legend_y - 10;});

      svg.selectAll("legend_text_v")
         .data(["low", "median", "high"])
         .enter()
         .append("text")
         .text(function(d){return d;})
         .style("font-size", "14px")
         .attr("x", 1250)
         .attr("y", function(d, i){return legend_y + 25 + i * 40;});

      svg.selectAll("legend_text_v")
         .data(["Porperty", "Values"])
         .enter()
         .append("text")
         .text(function(d){return d;})
         .style("font-size", "14px")
         .attr("x", function(d, i){return 1420 + i * 6})
         .attr("y", function(d, i){return legend_y + 60 + i * 20;});

      svg.selectAll("legend_text_v")
         .data(["House Square", "Footage"])
         .enter()
         .append("text")
         .text(function(d){return d;})
         .style("font-size", "14px")
         .attr("x", function(d, i){return 1310 + i * 25})
         .attr("y", function(d, i){return legend_y + 135 + i * 15;});

      svg.append("text")
         .text("Santa Monica")
         .style("font-size", "16px")
         .style("font-weight", "bold")
         .attr("fill", "blue")
         .attr("x", 440)
         .attr("y", 420);
      
      var txt1 = ["In the above bivariate choropleth, we can observe that the ",
                  "distribution of property value and the building square ",
                  "footage are diversed. The sub-urban region tends to have both ",
                  "higher building square footage and values. The effect of ",
                  "sub-urbanization in Los Angeles is likely remained that people ",
                  "have higher tendency to live in the outskirt with better living ",
                  "space and commute to work in the downtown. In my hypothesis, ",
                  "the high property values in the outskirt are driven by the ",
                  "residential properties which contain larger space and facilities, ",
                  "and the high property value in the city center is driven by the ",
                  "profitability of commercial properties."]

      svg.selectAll('article1')
         .attr("class", "txt1")
         .data(txt1)
         .enter()
         .append("text")
         .text(function(d){return d;})
         .attr("width", width)
         .attr("x", 100)
         .attr("y", function(d, i){return 500 + i * 15})
         .style("font-size", "14px")
   });
   LA_summary_line();
   ridge("CL", "", "1")
}


function article_insert(){

   select("body").append("div").attr("class", "bar").attr("background", "white");
   select("body").append("div").attr("class", "bar").attr("background", "white");
   select("body").append("div").attr("class", "bar").attr("background", "white");
   select("body").append("div").attr("class", "bar").attr("background", "white");
   select("body").append("div").attr("class", "bar").attr("background", "white");
   select("body").append("div").attr("class", "bar").attr("background", "white");
   //select("body").append("div").attr("class", "bar").attr("background", "white");
   //select("body").append("div").attr("class", "bar").attr("background", "white");

   select("body").append("text").text("For More Detail, Static Analysis Can be Found at ")
   select("body").append("a")
                 .text("Static Analysis for Housing Properties in Santa Monica")
                 .attr("href", "https://tayuny.github.io/Santa_Monica_Static/")

   select("body").append("div").attr("class", "bar").attr("background", "white");

   select("body").append("text")
                 .attr("background", "rgb(241, 243, 245)")
                 .attr("align", "justify")
                 .text("Interactive Choropleth Panel for Properties in Santa Monica") 
                 .style("font-size", "28px")
                 .style("font-weitht", "bold")
   
}


function LA_summary_line(){

    d3.csv('./data/LA_summary_line.csv').then(function(data){
      tract_info(data, "1");
    });
};
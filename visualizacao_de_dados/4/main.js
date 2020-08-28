var myApp = (function(){
    
'use strict';
    
var self = {};

self.dataset = [ [5, 20], [480, 90], [250, 50], [100, 33], [330, 95], [410, 12], [475, 44], [25, 67], [85, 21], [220, 88] ]; 

self.margins = {
    top: 10,
    bottom: 30,
    left: 25,
    right: 35
};

self.cw = 500;
self.ch = 300;

self.xScale = undefined;
self.yScale = undefined;
self.xAxis = undefined;
self.yAxis = undefined;

self.g = undefined;
    
self.brush = undefined;
self.zoom = undefined;

self.colorScale = d3.scaleLinear().domain(d3.extent(self.dataset, function (d) {return d[1];})).range(['blue', 'gray']);

self.generateNewData = function() {
    var n = Math.floor(Math.random()*10+5);
    
    console.log("Gerando " + n + " elementos")
    
    //limpando o array
    self.dataset.length = 0;
    //console.log(myApp.dataset);
    
    for (var i = 0; i < n; i++)
    {
        var coord = [Math.floor(Math.random()*480 +1), Math.floor(Math.random()*90+1)];
        self.dataset.push(coord);
    }
    
    console.log(self.dataset);
}

self.calculateColor = function (d, maxValue) 
{
    var r = d3.rgb(0,0, (255 * d / maxValue));
    return r;
}

self.appendSvg = function(element)
{
    var node = d3.select(element).append("svg")
        .attr("width", self.cw + self.margins.left + self.margins.right)
        .attr("height", self.ch + self.margins.bottom + self.margins.top);
    
    return node;
}

self.appendChartGroup = function(svg)
{
    var node = svg.append("g")
        .attr("id", "chart-area")
        .attr("width", self.cw)
        .attr("height", self.ch)
        .attr("transform", "translate( " + self.margins.left + ", " + self.margins.top + ")");
    
    return node;
}

self.createAxis = function(svg)
{
    self.xScale = d3.scaleLinear().domain(d3.extent(self.dataset, function (d) {return d[0];})).range([0, self.cw]);
    
    self.yScale = d3.scaleLinear().domain(d3.extent(self.dataset, function (d) {return d[1];})).range([self.ch, 0]);
    
    var xAxisGroup = svg.append('g') .attr('class', 'xAxis') .attr('transform', 'translate(' + self.margins.left + ',' + (self.ch + self.margins.top) + ')'); 
    
    var yAxisGroup = svg.append('g') .attr('class', 'yAxis') .attr('transform', 'translate(' + self.margins.left + ',' + (self.margins.top) + ')');
    
    self.xAxis = d3.axisBottom(self.xScale); 
    self.yAxis = d3.axisLeft(self.yScale); 
    
    xAxisGroup.call(self.xAxis);
    yAxisGroup.call(self.yAxis);
}

self.addBrush = function(svg)
{
    function brushed()
    {
        var s = d3.event.selection,
            x0 = s[0][0],
            y0 = s[0][1],
            x1 = s[1][0],
            y1 = s[1][1];
        
        svg.selectAll('circle')
            .style("fill", function(d) {
                if (self.xScale(d[0]) >= x0 && self.xScale(d[0]) <= x1 &&
                    self.yScale(d[1]) >= y0 && self.yScale(d[1]) <= y1){
                    return "#ec7014";
                } else {
                    return "rgb(150, 150, 190)";
                }
            });
    };
    
    self.brush = d3.brush()
            .on("start brush", brushed);
        
    svg.append("g")
        .attr("class", "brush")
        .call(self.brush);
}

self.addZoom = function(svg) 
{
    function zoomed()
    {
        var t = d3.event.transform;
        
        var nScaleX = t.rescaleX(self.xScale);
        self.xAxis.scale(nScaleX);
        
        var xAxisGroup = svg.select(".xAxis");
        xAxisGroup.call(self.xAxis);
        
        var chartArea = svg.select('#chart-area');
        
            chartArea.selectAll('circle')
                     .attr("cx", function(d) { return nScaleX(d[0]); });
        
            chartArea.selectAll('text')
                     .attr("x", function(d, i) { return nScaleX(d[0])+10; });
    }
    
    self.zoom = d3.zoom()
        .on("zoom", zoomed);
    
    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", self.cw)
        .attr("height", self.margins.bottom)
        .attr("transform", "translate(" + self.margins.left + "," + (self.ch + self.margins.top) + ")")
        .call(self.zoom);
}

self.appendCircles = function (g)
{   
    var circle = g.selectAll("circle")
        .data(self.dataset);
    
    var transition = d3.transition().duration(750);
    
    circle.style("fill", "rgb(150, 150, 190)")
          .transition(transition)
          .attr("cx", function(d){ return self.xScale(d[0]);})
          .attr("cy", function(d){return self.yScale(d[1]);})
          .attr("r", function(d){return self.yScale(d[1]) * 0.03 + 3;});
      
    
    circle.enter()
        .append("circle")
            .style("fill", "rgb(150, 150, 190)")
            .transition(transition)
            .attr("cx", function(d){ return self.xScale(d[0]);})
            .attr("cy", function(d){return self.yScale(d[1]);})
            .attr("r", function(d){return self.yScale(d[1]) * 0.03 + 3;});
        
    circle.exit()
        .transition(transition)
        .style("fill-opacity", 1e-6)
        .remove();
    
    circle = g.selectAll("circle")
            
    
    var text = g.selectAll("text")
        .data(self.dataset);
    
    text.attr("x", function(d, i) { return self.xScale(d[0])+10; })
        .attr("y", function(d) { return self.yScale(d[1]); })
    
    text.enter()
        .append("text")
            .text(function(d) { return d; })
            .attr("text-anchor", "left")
            .attr("x", function(d, i) { return self.xScale(d[0])+10; })
            .attr("y", function(d) { return self.yScale(d[1]); })
            .attr("font-family", "sans-serif") 
            .attr("font-size", "11px")
            .attr("fill", "red");
    
    text.exit().remove();
    
    return circle;
}

self.generateGraphic = function() 
{
    self.generateNewData();
    
    var sel = self.appendCircles(self.g);
    
    /*sel.style('fill', function(d) {
        return self.colorScale(d[1]);
    });*/
    
    //sel.style('fill', "rgb(150, 150, 190)");
}

self.run = function () 
{
    var svg = self.appendSvg("#mainDiv");
    self.g = self.appendChartGroup(svg);
    self.createAxis(svg);
    self.addBrush(self.g);
    self.addZoom(svg);
}

window.onload = self.run;
    
return {
    generateGraphic: self.generateGraphic
};
    
})();
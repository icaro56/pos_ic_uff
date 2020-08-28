'use strict';

var myApp = {};

myApp.dataset = [ [5, 20], [480, 90], [250, 50], [100, 33], [330, 95], [410, 12], [475, 44], [25, 67], [85, 21], [220, 88] ]; 

myApp.margins = {
    top: 10,
    bottom: 30,
    left: 25,
    right: 35
};

myApp.cw = 500;
myApp.ch = 300;

myApp.xScale = undefined;
myApp.yScale = undefined;
myApp.xAxis = undefined;
myApp.yAxis = undefined;

myApp.g = undefined;

myApp.colorScale = d3.scaleLinear().domain(d3.extent(myApp.dataset, function (d) {return d[1];})).range(['blue', 'gray']);

myApp.generateNewData = function() {
    var n = Math.floor(Math.random()*10+5);
    
    console.log("Gerando " + n + " elementos")
    
    //limpando o array
    myApp.dataset.length = 0;
    console.log(myApp.dataset);
    
    for (var i = 0; i < n; i++)
    {
        var coord = [Math.floor(Math.random()*480 +1), Math.floor(Math.random()*90+1)];
        myApp.dataset.push(coord);
    }
    
    console.log(myApp.dataset);
}

myApp.calculateColor = function (d, maxValue) 
{
    var r = d3.rgb(0,0, (255 * d / maxValue));
    return r;
}

myApp.appendSvg = function(element, x, y, w, h)
{
    var node = d3.select(element).append("svg")
        .attr("width", myApp.cw + myApp.margins.left + myApp.margins.right)
        .attr("height", myApp.ch + myApp.margins.bottom + myApp.margins.top);
    
    return node;
}

myApp.appendChartGroup = function(svg)
{
    var node = svg.append("g")
        .attr("width", myApp.cw)
        .attr("height", myApp.ch)
        .attr("transform", "translate( " + myApp.margins.left + ", " + myApp.margins.top + ")");
    
    return node;
}

myApp.createAxis = function(svg)
{
    myApp.xScale = d3.scaleLinear().domain(d3.extent(myApp.dataset, function (d) {return d[0];})).range([0, myApp.cw]);
    
    myApp.yScale = d3.scaleLinear().domain(d3.extent(myApp.dataset, function (d) {return d[1];})).range([myApp.ch, 0]);
    
    var xAxisGroup = svg.append('g') .attr('class', 'xAxis') .attr('transform', 'translate(' + myApp.margins.left + ',' + (myApp.ch + myApp.margins.top) + ')'); 
    
    var yAxisGroup = svg.append('g') .attr('class', 'yAxis') .attr('transform', 'translate(' + myApp.margins.left + ',' + (myApp.margins.top) + ')');
    
    var xAxis = d3.axisBottom(myApp.xScale); 
    var yAxis = d3.axisLeft(myApp.yScale); 
    
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);
}

myApp.appendCircles = function (g)
{   
    var circle = g.selectAll("circle")
        .data(myApp.dataset);
    
    circle.enter()
        .append("circle")
            .attr("cx", function(d){ return myApp.xScale(d[0]);})
            .attr("cy", function(d){return myApp.yScale(d[1]);})
            .attr("r", function(d){return myApp.yScale(d[1]) * 0.03 + 3;});
        
    circle.exit().remove();
    
    circle = g.selectAll("circle")
            
    
    var text = g.selectAll("text")
        .data(myApp.dataset);
    
    text.enter()
        .append("text")
            .text(function(d) { return d; })
            .attr("text-anchor", "left")
            .attr("x", function(d, i) { return myApp.xScale(d[0])+10; })
            .attr("y", function(d) { return myApp.yScale(d[1]); })
            .attr("font-family", "sans-serif") 
            .attr("font-size", "11px")
            .attr("fill", "red");
    
    text.exit().remove();
    
    return circle;
}

myApp.generateGraphic = function() 
{
    myApp.generateNewData();
    
    var sel = myApp.appendCircles(myApp.g);
    
    sel.style('fill', function(d) {
        return myApp.colorScale(d[1]);
    })
}

myApp.run = function () 
{
    var svg = myApp.appendSvg("#mainDiv");
    myApp.g = myApp.appendChartGroup(svg);
    myApp.createAxis(svg);
}

window.onload = myApp.run;
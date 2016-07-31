function explodingBoxplot() {
      
    // options which should be accessible via ACCESSORS
    var data_set = [];
    var _data_set = [];

    var groups;
    var exploded_box_plots = [];
var label_spacer = 10
    var options = {

      id: '',
      class: 'xBoxPlot',

      width: window.innerWidth,
     height: window.innerHeight,

      margins: {
         top:     10, 
         right:   10, 
         bottom:  30, 
         left:    80 
      },

      axes: {
         x: { 
            label:   '',
            ticks:   10,
            scale:   'linear',
            nice:    true,
            tickFormat:  undefined,
            domain:  undefined
         },
         y: { 
            label:   '',
            ticks:   10,

            scale:   'log',
            nice:    true,
            tickFormat:  function(n) { 
              if (label_spacer== 10){
                label_spacer=0
                return millisecondsToStr(n)
              } else{
                label_spacer += 1
                return ""
              }
              },

            domain:  undefined
         }
      },
      
      data: {
         color_index:   'color',
         label:         'undefined',
         group:         undefined,
         identifier:    undefined
      },

      datapoints: {
         radius: 3
      },

      display: {
         iqr:        1.5,   // interquartile range
         boxpadding: 0.2
      },

      resize: true,
      mobileScreenMax: 500

    }

    var constituents = {
       elements: {
          domParent:   undefined,
          chartRoot:   undefined
       },
       scales: {
          X:            undefined,
          Y:            undefined,
          color:        undefined
       }
    }

    var mobileScreen = ($( window ).innerWidth() < options.mobileScreenMax ? true : false);

    var default_colors = {
       0: "#a6cee3", 1: "#ff7f00", 2: "#b2df8a", 3: "#1f78b4", 4: "#fdbf6f",  5: "#33a02c",
       6: "#cab2d6", 7: "#6a3d9a", 8: "#fb9a99", 9: "#e31a1c", 10: "#ffff99", 11: "#b15928"
    };
    var colors = JSON.parse(JSON.stringify(default_colors));

    var update;

    // programmatic
    var transition_time = 200;

    // DEFINABLE EVENTS
    // Define with ACCESSOR function chart.events()
    var events = {
       'point': { 'click': null, 'mouseover': null, 'mouseout': null },
              'box': { 'mouseover': null, 'mouseout': null },

       'update': { 'begin': null, 'ready': null, 'end': null }
    };

    function chart(selection) {
        selection.each(function () {

            var domParent = d3.select(this);
            constituents.elements.domParent = domParent;

            var chartRoot = domParent.append('svg')
                .attr('class', 'svg-class')
            constituents.elements.chartRoot = chartRoot;

            // background click area added first
            var resetArea = chartRoot.append('g').append('rect')
               .attr('id', 'resetArea')
          .attr('width',options.width)
          .attr('height',options.height)
          .style('color','white')
          .style('opacity',0);

            // main chart area
            var chartWrapper = chartRoot.append("g").attr("class", "chartWrapper").attr('id', 'chartWrapper' + options.id)

            mobileScreen = ($( window ).innerWidth() < options.mobileScreenMax ? true : false);

            // boolean resize used to disable transitions during resize operation
            update = function(resize) {
label_spacer = 10
                chartRoot
                   .attr('width', (options.width + options.margins.left + options.margins.right) )
                   .attr('height', (options.height + options.margins.top + options.margins.bottom) );

                chartWrapper
                  .attr("transform", "translate(" + options.margins.left + "," + options.margins.top + ")");

                if (events.update.begin) { events.update.begin(constituents, options, events); }

                if (options.data.group) {
                  groups = d3.nest()
                      .key(function(k) { return k[options.data.group]; })
                      .entries(data_set)
                } else {
                     groups = [ {key: '', values: data_set } ]
                }

                var xScale = d3.scale.ordinal()
                     .domain(groups.map(function(d) { return d.key } ))
                     .rangeRoundBands([0, options.width - options.margins.left - options.margins.right], options.display.boxpadding);
                constituents.scales.X = xScale;

                //create boxplot data
                groups = groups.map(function(g) {
                     var o = compute_boxplot(g.values, options.display.iqr, options.axes.y.label);
                     o['group'] = g.key;
                     return o;
                });

                var yScale = d3.scale.log()
                     .domain(d3.extent(data_set.map(function(m) { return m[options.axes.y.label]; } )))
                     .range([options.height - options.margins.top - options.margins.bottom, 0])
                     .nice();
                constituents.scales.Y = yScale;

                colorScale = d3.scale.ordinal()
                     .domain(d3.set(data_set.map(function(m) { return m[options.data.color_index]; } )).values())
                     .range(Object.keys(colors).map(function(m) { return colors[m]; }));
                constituents.scales.color = colorScale;

                if (events.update.ready) { events.update.ready(constituents, options, events); }

                var xAxis = d3.svg.axis().scale(xScale).orient('bottom')
                var yAxis = d3.svg.axis().scale(yScale).orient('left').tickFormat(options.axes.y.tickFormat)

                resetArea
                  .on('dblclick', implode_boxplot);

                update_xAxis = chartWrapper.selectAll('#xpb_xAxis')
                   .data([0]);

                update_xAxis.enter()
                   .append('g')
                     .attr('class','explodingBoxplot x axis')
                     .attr('id', 'xpb_xAxis')
                   .append("text")
                     .attr('class','axis text')

                update_xAxis.exit()
                   .remove();

                update_xAxis
                     .attr("transform", "translate(0,"+ (options.height - options.margins.top - options.margins.bottom) +")")
                     .call(xAxis)
                   .select('.axis.text')
                     .attr("x",(options.width - options.margins.left - options.margins.right) / 2)
                     .attr("dy", ".71em")
                     .attr('y',options.margins.bottom)
                     .style("text-anchor", "middle")
                     .text(options.axes.x.label);

                update_yAxis = chartWrapper.selectAll('#xpb_yAxis')
                   .data([0]);

                update_yAxis.enter()
                   .append('g')
                     .attr('class','explodingBoxplot y axis')
                     .attr('id', 'xpb_yAxis')
                   .append("text")
                     .attr('class','axis text')

                update_yAxis.exit()
                   .remove();

                update_yAxis
                     .call(yAxis)
                   .select('.axis.text')
                     .attr("transform", "rotate(-90)")
                     .attr("x", -options.margins.top - d3.mean(yScale.range()))
                     .attr("dy", ".71em")
                     .attr('y', -options.margins.left)
                     .style("text-anchor", "middle")
                     .text(options.axes.y.label);


               var boxContent = chartWrapper.selectAll('.boxcontent')
                  .data(groups)

               boxContent.enter()
                  .append('g')
                  .attr('class','explodingBoxplot boxcontent')
                  .attr('id', function(d, i) { return 'explodingBoxplot' + options.id + i })

               boxContent.exit()
                  .remove();

               boxContent
                  .attr('transform',function(d){ return 'translate(' + xScale(d.group) + ',0)'; })
                  .each(create_jitter)
                  .each(create_boxplot)
                  .each(draw_boxplot)

                function create_jitter(g, i) {

                  d3.select(this).append('g')
                     .attr('class','explodingBoxplot outliers-points')
                  d3.select(this).append('g')
                     .attr('class','explodingBoxplot normal-points')
               };

               function init_jitter(s) {
                  s.attr('class','explodingBoxplot point')
                     .attr('r', options.datapoints.radius)
                     .attr('fill',function(d) {
                        return colorScale(d[options.data.color_index])
                     })
                     .on('mouseover', function(d, i, self) { 
                        if (events.point && typeof events.point.mouseover == 'function') {
                           events.point.mouseover(d, i, d3.select(this), constituents, options); 
                        }
                     })
                     .on('mouseout', function(d, i, self) { 
                        if (events.point && typeof events.point.mouseout == 'function') {
                           events.point.mouseout(d, i, d3.select(this), constituents, options); 
                        }
                     })
                     .on('click', function(d, i, self) { 
                        if (events.point && typeof events.point.click == 'function') {
                           events.point.click(d, i, d3.select(this), constituents, options); 
                        }
                     })
               };

               function draw_jitter(s) {
                  s.attr('r', options.datapoints.radius)
                   .attr('fill',function(d){
                     return colorScale(d[options.data.color_index])
                  })
                   .attr('cx', function(d) {
                     var w = xScale.rangeBand();
                     return Math.floor(Math.random() * w)
                  })
                  .attr('cy',function(d) {
                     return yScale(d[options.axes.y.label])
                  })
               };

               function create_boxplot(g, i) {
                  var s = d3.select(this).append('g')
                     .attr('class','explodingBoxplot box')
                     .attr('id','explodingBoxplot_box' + options.id + i)
                     .selectAll('.box')
                     .data([g]) 
                     .enter()

                  s.append('rect')
                     .attr('class','explodingBoxplot box')
                     .attr('fill',function(d){ return colorScale(d.normal[0][options.data.color_index]) })
                      .on('mouseover', function(d, i, self) { 
                        if (events.box && typeof events.box.mouseover == 'function') {
                           events.box.mouseover(d, i, d3.select(this), constituents, options); 
                        }
                     })
                     .on('mouseout', function(d, i, self) { 
                        if (events.box && typeof events.box.mouseout == 'function') {
                           events.box.mouseout(d, i, d3.select(this), constituents, options); 
                        }
                     })

                  s.append('line').attr('class','explodingBoxplot median line')    //median line
                  s.append('line').attr('class','explodingBoxplot min line hline') //min line
                  s.append('line').attr('class','explodingBoxplot line min vline') //min vline
                  s.append('line').attr('class','explodingBoxplot max line hline') //max line
                  s.append('line').attr('class','explodingBoxplot line max vline') //max vline
               };

               function draw_boxplot(s, i) {
                  d3.select('#explodingBoxplot_box' + options.id + i)
                     .on('click', function(d) {
                        explode_boxplot(i);
                        exploded_box_plots.push(i);
                     })

                  var s = d3.select(this);
                  if (exploded_box_plots.indexOf(i) >= 0) {
                     explode_boxplot(i);
                     jitter_plot(i);
                     return;
                  } else {
                     jitter_plot(i);
                  }
                  s.select('rect.box') // box
                     .transition().duration(transition_time)
                     .attr('x',0)
                     .attr('width',xScale.rangeBand())
                     .attr('y',function(d) { return yScale(d.quartiles[2]) })
                     .attr('height',function(d) {
                        return yScale(d.quartiles[0]) - yScale(d.quartiles[2]);
                     })
                     .attr('fill',function(d) { 
                        return colorScale(d.normal[0][options.data.color_index]);
                     });
                  s.select('line.median') // median line
                     .transition().duration(transition_time)
                     .attr('x1',0).attr('x2',xScale.rangeBand())
                     .attr('y1',function(d){return yScale(d.quartiles[1])})
                     .attr('y2',function(d){return yScale(d.quartiles[1])})
                  s.select('line.min.hline') // min line
                     .transition().duration(transition_time)
                     .attr('x1',xScale.rangeBand()*0.25)
                     .attr('x2',xScale.rangeBand()*0.75)
                     .attr('y1',function(d){return yScale(Math.min(d.min,d.quartiles[0]))})
                     .attr('y2',function(d){return yScale(Math.min(d.min,d.quartiles[0]))})
                  s.select('line.min.vline') // min vline
                     .transition().duration(transition_time)
                     .attr('x1',xScale.rangeBand()*0.5)
                     .attr('x2',xScale.rangeBand()*0.5)
                     .attr('y1',function(d){return yScale(Math.min(d.min,d.quartiles[0]))})
                     .attr('y2',function(d){return yScale(d.quartiles[0])})
                  s.select('line.max.hline') // max line
                     .transition().duration(transition_time)
                     .attr('x1',xScale.rangeBand()*0.25)
                     .attr('x2',xScale.rangeBand()*0.75)
                     .attr('y1',function(d){return yScale(Math.max(d.max,d.quartiles[2]))})
                     .attr('y2',function(d){return yScale(Math.max(d.max,d.quartiles[2]))})
                  s.select('line.max.vline') // max vline
                     .transition().duration(transition_time)
                     .attr('x1',xScale.rangeBand()*0.5)
                     .attr('x2',xScale.rangeBand()*0.5)
                     .attr('y1',function(d){return yScale(d.quartiles[2])})
                     .attr('y2',function(d){return yScale(Math.max(d.max,d.quartiles[2]))})
               };

               function hide_boxplot(g, i) {
                  var s = this
                  s.select('rect.box')
                     .attr('x',xScale.rangeBand()*0.5)
                     .attr('width',0)
                     .attr('y',function(d){return yScale(d.quartiles[1])})
                     .attr('height',0)
                  s.selectAll('line') //median line
                     .attr('x1',xScale.rangeBand()*0.5)
                     .attr('x2',xScale.rangeBand()*0.5)
                     .attr('y1',function(d){return yScale(d.quartiles[1])})
                     .attr('y2',function(d){return yScale(d.quartiles[1])})
               };

               function explode_boxplot(i) {
                  d3.select('#' + 'explodingBoxplot' + options.id + i)
                     .select('g.box').transition()
                     .ease(d3.ease('back-in'))
                     .duration((transition_time * 1.5))
                     .call(hide_boxplot)

                  var explode_normal = d3.select('#' + 'explodingBoxplot' + options.id + i)
                     .select('.normal-points')
                     .selectAll('.point')
                     .data(groups[i].normal)

                  explode_normal.enter()
                     .append('circle')

                  explode_normal.exit()
                     .remove()

                  explode_normal
                     .attr('cx', xScale.rangeBand() * 0.5)
                     .attr('cy', yScale(groups[i].quartiles[1]))
                     .call(init_jitter)
                     .transition()
                     .ease(d3.ease('back-out'))
                     .delay(function(){
                        return (transition_time * 1.5) + 100 * Math.random()
                     })
                     .duration(function(){
                        return (transition_time * 1.5) + (transition_time * 1.5) * Math.random()
                     })
                     .call(draw_jitter)
               };

               function jitter_plot(i) {
                  var elem = d3.select('#' + 'explodingBoxplot' + options.id + i)
                     .select('.outliers-points');

                  var display_outliers = elem.selectAll('.point')
                     .data(groups[i].outlier)

                  display_outliers.enter()
                     .append('circle')

                  display_outliers.exit()
                     .remove()

                  display_outliers
                     .attr('cx', xScale.rangeBand() * 0.5)
                     .attr('cy', yScale(groups[i].quartiles[1]))
                     .call(init_jitter)
                     .transition()
                     .ease(d3.ease('back-out'))
                     .delay(function(){
                        return (transition_time * 1.5) + 100 * Math.random()
                     })
                     .duration(function(){
                        return (transition_time * 1.5) + (transition_time * 1.5) * Math.random()
                     })
                     .call(draw_jitter)
               };

               function implode_boxplot(elem, g) {
                  exploded_box_plots = [];
                  chartWrapper.selectAll('.normal-points')
                     .each(function(g){
                        d3.select(this)
                           .selectAll('circle')
                           .transition()
                           .ease(d3.ease('back-out'))
                           .duration(function(){
                              return (transition_time * 1.5) + (transition_time * 1.5) * Math.random()
                           })
                           .attr('cx', xScale.rangeBand() * 0.5)
                           .attr('cy', yScale(g.quartiles[1]))
                           .remove()
                     })

                  chartWrapper.selectAll('.boxcontent')
                     .transition()
                     .ease(d3.ease('back-out'))
                     .duration((transition_time * 1.5))
                     .delay(transition_time)
                     .each(draw_boxplot)
               };

               if (events.update.end) {
                  setTimeout(function() { 
                     events.update.end(constituents, options, events); 
                  }, transition_time);
            }

            } // end update()

        });
    }

    // ACCESSORS

    // chart.options() allows updating individual options and suboptions
    // while preserving state of other options
    chart.options = function(values) {
        if (!arguments.length) return options;
        keyWalk(values, options);
        return chart;
    }

    function keyWalk(valuesObject, optionsObject) {
        if (!valuesObject || !optionsObject) return;
        var vKeys = Object.keys(valuesObject);
        var oKeys = Object.keys(optionsObject);
        for (var k=0; k < vKeys.length; k++) {
           if (oKeys.indexOf(vKeys[k]) >= 0) {
              var oo = optionsObject[vKeys[k]];
              var vo = valuesObject[vKeys[k]];
              if (typeof oo == 'object' && typeof vo !== 'function') {
                 keyWalk(valuesObject[vKeys[k]], optionsObject[vKeys[k]]);
              } else {
                 optionsObject[vKeys[k]] = valuesObject[vKeys[k]];
              }
           }
        }
    }

    chart.events = function(functions) {
         if (!arguments.length) return events;
         keyWalk(functions, events);
         return chart;
    }

    chart.constituents = function() {
         return constituents;
    }

    chart.colors = function(color3s) {
        if (!arguments.length) return colors;            // no arguments, return present value
        if (typeof color3s !== 'object') return false;   // argument is not object
        var keys = Object.keys(color3s);        
        if (!keys.length) return false;                  // object is empty
        // remove all properties that are not colors
        keys.forEach(function(f) { if (! /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color3s[f])) delete color3s[f]; })
        if (Object.keys(color3s).length) {
           colors = color3s;
        } else {
           colors = JSON.parse(JSON.stringify(default_colors)); // no remaining properties, revert to default
        }
        return chart;
    }

    chart.width = function(value) {
        if (!arguments.length) return options.width;
        options.width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return options.height;
        options.height = value;
        return chart;
    };

    chart.data = function(value) {
        if (!arguments.length) return data_set;
        value.sort(function(x, y) { return x['Tag'].split('-').join('')-y['Tag'].split('-').join('') }); 
        data_set = JSON.parse(JSON.stringify(value));
        return chart;
    };

    chart.push = function(value) {
       var _value = JSON.parse(JSON.stringify(value));
       if (!arguments.length) return false;
       if ( _value.constructor === Array ) {
          for (var i=0; i < _value.length; i++) { 
             data_set.push(_value[i]); 
             _data_set.push(_value[i]); 
          }
       } else {
          data_set.push(_value);
          _data_set.push(_value);
       }
       return true;
    }

    chart.pop = function() {
       if (!data_set.length) return;
       var count = data_set.length;
       _data_set.pop();
       return data_set.pop();
    };

    chart.update = function(resize) {
      if (typeof update === 'function') update(resize);
    }

    chart.duration = function(value) {
        if (!arguments.length) return transition_time;
       transition_time = value;
       return chart;
    }

    // END ACCESSORS
    
   var compute_boxplot = function(data, iqr_scaling_factor, value) {
       iqr_scaling_factor = iqr_scaling_factor || 2;
       value = value || Number;

       var seriev = data.map(function(m) { return Math.log(m[value]); }).sort(d3.ascending);

       var quartiles = [
         d3.quantile(seriev, 0.25),
         d3.quantile(seriev, 0.5),
         d3.quantile(seriev, 0.75)
       ].map(Math.exp)

       var iqr = (quartiles[2] - quartiles[0]) * iqr_scaling_factor;

       // separate outliers
       var max = Number.MIN_VALUE
       var min = Number.MAX_VALUE
       var box_data = d3.nest()
          .key(function(d) {
            var v = d[value];
            var type = (v < quartiles[0] - iqr || v > quartiles[2] + iqr) ? 'outlier' : 'normal';
            if( type== 'normal' && (v < min || v > max)) {
               max = Math.max(max, v);
               min = Math.min(min, v);
            }
            return type;
          })
          .map(data);

         if (!box_data.outlier) box_data.outlier = []

         box_data.quartiles = quartiles

         box_data.iqr = iqr
         box_data.max = max
         box_data.min = min

       return box_data
   }

   return chart;
}
function millisecondsToStr (milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding (number) {
        return (number > 1) ? 's' : '';
    }

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks? 
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + ' min' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + ' sec' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
}
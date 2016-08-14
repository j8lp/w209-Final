!function() {

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
        return minutes + ' minute' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
}

   // module container
   var boxPlotFunctions = {};

   boxPlotFunctions.removeTooltip = removeTooltip;
   function removeTooltip (d, i, element) {
      if (!$(element).popover) return; 
      $('.popover').each(function() {
         $(this).remove();
      }); 
   }

   boxPlotFunctions.showTooltip = showTooltip;
   function showTooltip (d, i, element, constituents, options) {
      if (!$(element).popover) return; 
      $(element).popover({
         placement: 'auto top',
         container: '#' + constituents.elements.domParent.attr('id'),
         trigger: 'manual',
         html : true,
         content: function() { 
            var identifier = options.data.identifier && d[options.data.identifier] ?
               d[options.data.identifier] : 'undefined';
            var value = options.axes.y.label && d[options.axes.y.label] ?
               millisecondsToStr(d[options.axes.y.label]) : '';

            var message = "<span style='font-size: 11px; text-align: center;'>";
            message += d[options.data.identifier] + ': ' + d[options.axes.y.label] + "</span>"; 

            return message;
         }
      });
      $(element).popover('show');
   }

   boxPlotFunctions.defineTooltip = defineTooltip;
   function defineTooltip(constituents, options, events) {
       var tip = d3.tip().attr('class','explodingBoxplot tip')
            .direction('n')
            .html(tipFunction)

       function tipFunction(d) {
          var color = options.data.color_index && d[options.data.color_index] ?
             constituents.scales.color(d[options.data.color_index]) : 'blue';
          var identifier = options.data.identifier && d[options.data.identifier] ?
             d[options.data.identifier] : 'undefined';
          var value = options.axes.y.label && d[options.axes.y.label] ?
             millisecondsToStr(d[options.axes.y.label]) : '';
          var message = ' <span style="color:' + color + '">' + identifier + 
                        '</span><span style="color:#DDDDDD;" > : ' + value + '</span>';
          return message;
       }

  function openWindowFunction(d) {
  var win = window.open('http://stackoverflow.com/questions/'+d.Id, '_blank');
if (win) {
    //Browser has allowed it to be opened
    win.focus();
       }
}

       events.point.mouseover = tip.show;
       events.point.mouseout = tip.hide;

       events.point.click = openWindowFunction

       if (constituents.elements.chartRoot) constituents.elements.chartRoot.call(tip);


       var tipBox = d3.tip().attr('class','explodingBoxplot tip')
            .direction('n')
            .html(tipBoxFunction)

      function tipBoxFunction(d) {
          var color = d["group"] ?
             constituents.scales.color(d["group"]) : 'blue';
          var identifier = d["group"] ?
             d["group"] : 'undefined';
          var quartiles =  d["quartiles"] ?  d["quartiles"]: ["NA","NA","NA"];
          var message = ' <span style="color:' + color + '">' + identifier + 
                        '</span><span style="color:' + color + '"><br>3rd Quartile</span><span style="color:#DDDDDD;" > : ' +
millisecondsToStr(quartiles[2]) +  '</span><br><span style="color:' + color + 
'">Median</span></span><span style="color:#DDDDDD;" > : ' + 
millisecondsToStr(quartiles[1]) +  '</span><br><span style="color:' + color + 
'">1st Quartile</span></span><span style="color:#DDDDDD;" > : ' 
                         + millisecondsToStr(quartiles[0]) + '</span><br> (click to see individual points)';
          return message;
       }
       events.box.mouseover = tipBox.show;
       events.box.mouseout = tipBox.hide;
              if (constituents.elements.chartRoot) constituents.elements.chartRoot.call(tipBox);


   }

 function populateTagsSelect(Tags){

        select = document.getElementById("TagsSelect");
var arrayLength = Tags.length
for (var i = 0; i < arrayLength; i++) {
Tag = Tags[i]
            var opt = document.createElement('option');
            opt.value = Tag.Name
            opt.innerHTML = Tag.Name + " (" + Tag.Count +")"
            if (Tag.Name == "python" || Tag.Name == "java"){
               opt.selected = "selected";
            }
           select.appendChild(opt);
        
    }
}
      var data;

function getSelectedTags() {
    var select1 = document.getElementById("TagsSelect");
    var selected1 = [];
    for (var i = 0; i < select1.length; i++) {
        if (select1.options[i].selected) selected1.push(select1.options[i].value);
    }
    return selected1}

 function filterdata(){


        var selectedTags = getSelectedTags()
        var len = selectedTags.length
                 var limits = [];
var useSample = document.getElementById("sample").checked
var Accepted = document.getElementById("acceptedA").checked

        if( useSample){
                 var limits = [];

                var sample_size = document.getElementById("sample_size").value
  for (var i = 0; i < len; i++) {
    limits.push(sample_size);
  }
        }

         return data.filter(function (d){
            index = selectedTags.indexOf(d.Tag)
            if(index > -1 && (!Accepted || d.Accepted.length)) {
            if(useSample ){
            limits[index] -= 1
            return limits[index] >= 0
            }
return 1
            } else{
              return 0
            }
 })}


   boxPlotFunctions.defaultDistribution = defaultDistribution;

   function defaultDistribution(tooltip) {
    d3.csv("TagCounts.csv",function(error,Tags){
        if (error) throw error;
        populateTagsSelect(Tags)
$('#TagsSelect').multiselect({
  includeSelectAllOption: true,
  selectAllText: "Clear All",
              maxHeight: 400,
            enableCaseInsensitiveFiltering: true,
  onChange:function() { 
  var filtereddata = filterdata(data )
            boxPlotFunctions.xbp.data(filtereddata);
            boxPlotFunctions.xbp.update();
         
      },
 onSelectAll: function() {
$('#TagsSelect').multiselect("deselectAll",true)
        }

    }
      )
      var default_distributions = 'PostDurations.json';
      var container = d3.select('#pointDistributions');

      d3.json(default_distributions, function(error, result) {


         if (error || !result) return;
                  var xbp = explodingBoxplot();
         boxPlotFunctions.xbp = xbp;


         data = d3.shuffle(result)


         if (tooltip) {
            if (tooltip == 'popover') xbp.events({ 'point': { 'mouseover': showTooltip, 'mouseout': removeTooltip } });
            if (tooltip == 'd3-tip') xbp.events({ 'update': { 'ready': defineTooltip } });
         }

         xbp.options(
            { 
               id:   'demo',
               data: { 
                  group: 'Tag', 
                  color_index: 'Tag',
                  identifier: 'Title'
               }, 
               width: 700, 
               height: 480, 
               axes: { 
                  x: { label: 'Tag' }, 
                  y: { label: 'Duration to First Answer' } 
               } 
            }
         );

var filtereddata =  filterdata()
         xbp.data(filtereddata );
         container.call(xbp);
         xbp.update();

      });
   
   });
  }

   boxPlotFunctions.demoSetup = demoSetup;
   function demoSetup() {
      var original_sample_size = 200
      var original_height;

      var vizcontrol = d3.select('#controls');
      var viztable = vizcontrol.append('table').attr('align', 'center');

      var row13 = viztable.append('tr').append('td').attr('align', 'left');
      row13.append('input').attr('name', 'attribute').attr('id', 'acceptedA').attr('type', 'radio').attr('value', 'acceptedA');
      row13.append('label').html('&nbsp; Duration to Accepted Answer').style('font-size', '12px');
      document.getElementById("acceptedA").addEventListener("change", function() { 
         boxPlotFunctions.xbp.options( { axes: { y: { label: 'Duration to Accepted Answer' } } });
         var filtereddata =  filterdata()
         boxPlotFunctions.xbp.data(filtereddata );
         boxPlotFunctions.xbp.update();      
      });

      var row14 = viztable.append('tr').append('td').attr('align', 'left');
      row14.append('input').attr('name', 'attribute').attr('id', 'firstA').attr('type', 'radio').attr('value', 'firstA').attr('checked', 'checked');
      row14.append('label').html('&nbsp; Duration to First Answer').style('font-size', '12px');
      document.getElementById("firstA").addEventListener("change", function() { 
         boxPlotFunctions.xbp.options( { axes: { y: { label: 'Duration to First Answer' } } });

         var filtereddata =  filterdata()
         boxPlotFunctions.xbp.data(filtereddata );
         boxPlotFunctions.xbp.update(); 

         boxPlotFunctions.xbp.update();
      });


      var row3 = viztable.append('tr').append('td').append('hr');

      var row10 = viztable.append('tr').append('td').attr('align', 'left');
      row10.append('label').html('&nbsp; Tags').style('font-size', '12px');


      var row11 = viztable.append('tr').append('td').attr('align', 'left');
      row11.append('select').attr('name', 'Tags').attr('id', 'TagsSelect').attr('multiple', 'multiple')

      var row12 = viztable.append('tr').append('td').append('hr');

      var row4 = viztable.append('tr').append('td').attr('align', 'left');
      row4.append('input').attr('name', 'colors').attr('id', 'no_sample').attr('type', 'radio').attr('value', 'no_sample');
      row4.append('label').html('&nbsp; No Sampling').style('font-size', '12px');
      document.getElementById("no_sample").addEventListener("change", function() { 
        document.getElementById("sample_size").disabled = true;
        original_sample_size = document.getElementById("sample_size").value
                document.getElementById("sample_size").value = "";
var filtereddata =  filterdata()
         boxPlotFunctions.xbp.data(filtereddata );
         boxPlotFunctions.xbp.update();      });

      var row5 = viztable.append('tr').append('td').attr('align', 'left');
      row5.append('input').attr('name', 'colors').attr('id', 'sample').attr('type', 'radio').attr('value', 'no_sample').attr('checked', 'checked');
      row5.append('label').html('&nbsp; Sample Data').style('font-size', '12px');
      document.getElementById("sample").addEventListener("change", function() { 
                document.getElementById("sample_size").disabled = false;
        document.getElementById("sample_size").value = original_sample_size;
var filtereddata =  filterdata()
         boxPlotFunctions.xbp.data(filtereddata );
         boxPlotFunctions.xbp.update();      });


     var row7 = viztable.append('tr').append('td').attr('align', 'left');
      row7.append('label').html('&nbsp; Sample Size').style('font-size', '12px');


      var row8 = viztable.append('tr').append('td').attr('align', 'left');
      row8.append('input').attr('name', 'sample_size').attr('id', 'sample_size').attr('type', 'number').attr("min",1).attr('value', original_sample_size);
      document.getElementById("sample_size").addEventListener("change", function() { 
var filtereddata =  filterdata()
         boxPlotFunctions.xbp.data(filtereddata );
         boxPlotFunctions.xbp.update();
      });
      var row6 = viztable.append('tr').append('td')
      row6.attr('align', 'left').html('(High sample sizes may reduce performance)').style('font-size', '10px');

      var row12 = viztable.append('tr').append('td').append('hr');
      var row13 = viztable.append('tr').append("div").attr("id","rcorners").append('td').attr('align', 'left')
                          .html('Expand: click on boxes<br/>Reset: double-click background');

   }

   if (typeof define === "function" && define.amd) define(boxPlotFunctions); else if (typeof module === "object" && module.exports) module.exports = boxPlotFunctions;
   this.boxPlotFunctions = boxPlotFunctions;

}();


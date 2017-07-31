TabAnnotations = {
  "2010": [
    "Welcome! This is an exploration of data on programming languages!",
    "The pie chart represents the breakdown of commits to public GitHub repos by programming language.",
    "The data has been filtered to the top languages by commit number.",
    "To begin, we start in 2010, 2 years after GitHub was launched to the public.",
    "Hover over each slice for more information."
  ],
  "2011": [
    "GitHub Commits by Language - 2011",
    "Apple releases iOS 5 in early 2011. Commits in Objective-C experience an increase of 150%.",
    "A new version of ECMAScript is released in June 2011. Javascript's commit numbers increase by ",
  ],
  "2012": [
    "GitHub Commits by Language - 2012",
    "PHP shrinks as Javascript gains more numbers"
  ],
  "2013": [
    "GitHub Commits by Language - 2013",
    "Microsoft's Visual Studio 2013 is launched with support for TypeScript.",
    "Go 1.1 is released"
  ],
  "2014": [
    "GitHub Commits by Language - 2014",
    "Ruby",
    "Lisp is overshadowed by Rust"
  ],
  "2015": [
    "GitHub Commits by Language - 2015",
    "Go",
    "Ruby",
    "TODO"
  ]
}

window.onload = function() {
  var redrawPieChart = initPieChart();
  redrawPieChart("2010");
  // Add click Handlers
  var currActiveTab = "#tab-2010";
  showAnnotations(2010);
  for (var i = 2010; i < 2016; i++) {
    $('#tab-' + i).click(makeTabClickCallback(i));
  }

  $('#tab-explore').click(function() {
    if (currActiveTab == "#tab-explore") {
      return
    }
    $(currActiveTab).removeClass("active");
    currActiveTab = "#tab-explore";
    $('#tab-explore').addClass("active");
    $('#pie-chart-container').hide();
    $('#slide-header').hide();
    $('#slide-annotations').hide();
    $('#explore-container').show();
    redrawLineGraph([]);
  });

  $( "#y-axis-selector" ).change(function() {
    var newYAxis;
    var selection = $( "#y-axis-selector" ).val();
    if (selection == "Git Commits") {
      newYAxis = "num_git_commits";
    } else {
      newYAxis = "so_ques_asked";
    }
    if (currYAxis == newYAxis) {
      // do nothing
      return;
    }

    currYAxis = newYAxis;
    redrawLineGraph();
  });

  function makeTabClickCallback(tabID) {
    return function() {
      activeTab = '#tab-' + tabID;
      if (activeTab == currActiveTab) {
        return;
      }
      if (currActiveTab == "#tab-explore") {
        $('#explore-container').hide();
        $('#pie-chart-container').show();
      }
      $(currActiveTab).removeClass("active");
      $(activeTab).addClass("active");
      currActiveTab = activeTab;
      redrawPieChart('' + tabID);
      showAnnotations(tabID);
    }
  }

  function showAnnotations(year) {
    var header = TabAnnotations[year][0];
    var annotations = TabAnnotations[year].slice(1, TabAnnotations[year].length)

    $('#slide-header h4').html(header);
    $('#slide-annotations').hide();
    $('#slide-annotations ul').empty();
    for (var i = 0; i < annotations.length; i++) {
      var $li = $('<li>').append('<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>  ' + annotations[i]);
      $li.addClass("list-group-item");
      $('#slide-annotations ul').append($li);
    }
    $('#slide-header').show();
    $('#slide-annotations').show();
  }
}

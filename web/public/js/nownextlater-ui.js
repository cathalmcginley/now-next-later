// var DragAndDrop = function() {
//
//   var dragHandle = function(event) {
//     var titleHtml = $(event.target).html();
//     return $("<div class='drag-handle'>" + titleHtml + "</div>");
//   }
//
//   // TODO fix to prevent cyclic dependencies in UI
//
//   var draggableOptions = { //containment: "#tasks-now-column",
//    revert:'invalid',
//    handle: 'div.title',
//     opacity: 0.9,
//     helper: dragHandle,
//    start: function() {
//      $( this ).addClass("being-dragged");
//    },
//    stop: function() {
//        $( this ).removeClass("being-dragged");
//     }
//  };
//
//
//  var droppableOptions = {
//    activeClass: "ui-state-default", // lights up possible targets
//    hoverClass: "ui-state-hover",    // lights up when about to be droppped on
//    drop: function( event, ui ) {
//      $( this )
//        .addClass( "ui-state-highlight" );
//        // TODO add red Blocker tag to bottom of div
//        // TODO open up div if not already open
//        //.find( "div.summary" )
//        //   .html( "Dropped!" );
//      var dragId = ui.draggable.attr('id');
//      var dropId = $( this ).attr('id');
//      console.log(dragId + " dropped onto " + dropId);
//      // TODO TODO NOW NOW - POST to 84902aef-849../dependencies/
//    }}
//
//     return {
//       drag: draggableOptions,
//       drop: droppableOptions
//     }
//   }
//
// var dndOptions = DragAndDrop();
//
//
// var dndEnable = function(taskUuid) {
//     console.log(typeof taskUuid);
//     var selector = '#' + taskUuid;
//     console.log(">!!> " + selector);
//
//     $(selector).draggable(dndOptions.drag);
//     $(selector).droppable(dndOptions.drop);
//     console.log("done?!!");
//
// }
//
// var dndEnableAll = function(uuids) {
//   $(function() {
//     for (var i=0; i<uuids.length; i++) {
//       dndEnable(uuids[i]);
//     }
//   });
// }

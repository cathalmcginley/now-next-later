
// First, let's create a namespace.  It's not required, but it's usually a
// good idea.
var NowNextLaterUI = NowNextLaterUI || {};

// the namespace.  Note that our module is actually a function.  We're going
  // to use JavaScript closures to emulate private methods, which are not
  // natively part of JavaScript.
  NowNextLaterUI.MyModule = function()
  {

    // Let's define a private and public property.  Note that we define them in
    // exactly the same way.  The bit that specifies whether they are
    // public/private comes later...
    var myPrivateProperty = 2;
    var myPublicProperty = 1;

    // Let's declare a simple private function.
    var myPrivateFunction = function()
    {
      console.log("myPrivateFunction()");
    };

    // Now let's declare a public function.  Again, note that the function
    // definition is exactly the same as the private one.
    var myPublicFunction = function()
    {
      console.log("myPublicFunction()");

      // Just for fun, let's call our private function.  Note that while we are
      // inside the module, we have full access to all Module properties and
      // functions, just like if we were inside a class.
        console.log("before");
        myPrivateFunction();
        console.log("after");
    };

    // Let's make a setup function for this module: something that is called
    // once when it's loaded.  I generally like to call my setup functions
    // init().
    var init = function()
    {
      // Do some setup stuff
      console.log("init() setting up jQuery-ui");
      $(function() {
        $( "#aButton" ).draggable();
      });
    };

    // This is the part that separates the private and public stuff.  Anything
    // in this object becomes public.  Anything NOT in this object becomes
    // private.
    var oPublic =
    {
      init: init,
      myPublicProperty: myPublicProperty,
      myPublicFunction: myPublicFunction
    };

    return oPublic;
  }();



// var NowNextLaterUI = ( function( window ) {
//
//   // this object is used to store private variables and methods across multiple instantiations
//   var privates = {};
//
//   function NowNextLaterUI() {
//
//     this.init = function init(num) {
//       //alert( 'my method ' + num );
//       $(function() {
//         $( "#aButton" ).draggable();
//       });
//       // var b = $("#aButton");
//       // b.draggable();
//       // b.style.background-color = 'red';
//     };
//
//     this.myOtherMethod = function myOtherMethod() {
//       alert( 'my other method' );
//     };
//
//   }
//
//   return NowNextLaterUI;
//
// } )( window );

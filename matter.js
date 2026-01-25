/* ===================== MATTER.JS BACKGROUND – FINAL RESPONSIVE VERSION ===================== */

/* Wrapper */
var canvasWrapper = document.querySelector("#wrapper-canvas");

/* Mobile detection */
var isMobile =
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );

/* Viewport dimensions (ALWAYS viewport, never scrollHeight) */
var dimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/* Plugins */
Matter.use("matter-attractors");
Matter.use("matter-wrap");

function runMatter() {
  /* Module aliases */
  var Engine = Matter.Engine,
    Events = Matter.Events,
    Runner = Matter.Runner,
    Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Common = Matter.Common,
    Bodies = Matter.Bodies;

  /* ===================== ENGINE ===================== */
  var engine = Engine.create();

  /* Stability tuning */
  engine.positionIterations = isMobile ? 4 : 6;
  engine.velocityIterations = isMobile ? 3 : 4;

  engine.world.gravity.x = 0;
  engine.world.gravity.y = 0;
  engine.world.gravity.scale = 0;

  /* ===================== RENDERER ===================== */
  var render = Render.create({
    element: canvasWrapper,
    engine: engine,
    options: {
      width: dimensions.width,
      height: dimensions.height,
      wireframes: false,
      background: "transparent",
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    },
  });

  /* ===================== RUNNER ===================== */
  var runner = Runner.create();

  /* ===================== WORLD ===================== */
  var world = engine.world;

  /* ===================== WALLS (VIEWPORT SAFE) ===================== */
  var wallThickness = 120;

  var walls = [
    Bodies.rectangle(
      dimensions.width / 2,
      -wallThickness,
      dimensions.width,
      wallThickness,
      { isStatic: true }
    ),
    Bodies.rectangle(
      dimensions.width / 2,
      dimensions.height + wallThickness,
      dimensions.width,
      wallThickness,
      { isStatic: true }
    ),
    Bodies.rectangle(
      -wallThickness,
      dimensions.height / 2,
      wallThickness,
      dimensions.height,
      { isStatic: true }
    ),
    Bodies.rectangle(
      dimensions.width + wallThickness,
      dimensions.height / 2,
      wallThickness,
      dimensions.height,
      { isStatic: true }
    ),
  ];

  World.add(world, walls);

  /* ===================== ATTRACTOR ===================== */
  var attractor = Bodies.circle(
    dimensions.width / 2,
    dimensions.height / 2,
    Math.min(dimensions.width, dimensions.height) / 18,
    {
      isStatic: true,
      render: {
        fillStyle: "#000000",
      },
      plugin: {
        attractors: [
          function (bodyA, bodyB) {
            var strength = isMobile ? 0.000001 : 0.000002;
            return {
              x: (bodyA.position.x - bodyB.position.x) * strength,
              y: (bodyA.position.y - bodyB.position.y) * strength,
            };
          },
        ],
      },
    }
  );

  World.add(world, attractor);

  /* ===================== PARTICLES ===================== */
  var PARTICLE_COUNT = isMobile ? 20 : 60;

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    var x = Common.random(0, dimensions.width);
    var y = Common.random(0, dimensions.height);

    var size = Common.random(6, 40);
    var sides = Common.random(3, 6);

    var poly = Bodies.polygon(x, y, sides, size, {
      mass: size / 25,
      frictionAir: isMobile ? 0.06 : 0.04,
      render: {
        fillStyle: "#222222",
        strokeStyle: "#000000",
        lineWidth: 2,
      },
    });

    var circleSmall = Bodies.circle(x, y, Common.random(2, 8), {
      mass: 0.1,
      frictionAir: isMobile ? 0.05 : 0.03,
      render: {
        fillStyle: "#444444",
        strokeStyle: "#000000",
        lineWidth: 1,
      },
    });

    var circleMedium = Bodies.circle(x, y, Common.random(6, 14), {
      mass: 0.3,
      frictionAir: isMobile ? 0.04 : 0.02,
      render: {
        fillStyle: "#333333",
        strokeStyle: "#111111",
        lineWidth: 2,
      },
    });

    World.add(world, [poly, circleSmall, circleMedium]);
  }

  /* ===================== POINTER FOLLOW (MOUSE + TOUCH SAFE) ===================== */
  var pointer = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };

  window.addEventListener("mousemove", function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  window.addEventListener(
    "touchmove",
    function (e) {
      if (e.touches && e.touches.length > 0) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
      }
    },
    { passive: true }
  );

  Events.on(engine, "afterUpdate", function () {
    Body.translate(attractor, {
      x: (pointer.x - attractor.position.x) * 0.15,
      y: (pointer.y - attractor.position.y) * 0.15,
    });
  });

  /* ===================== START ===================== */
  Runner.run(runner, engine);
  Render.run(render);

  return {
    engine,
    render,
    runner,
  };
}

/* ===================== INIT ===================== */
var matterInstance = runMatter();

/* ===================== RESIZE HANDLING ===================== */
window.addEventListener("resize", function () {
  dimensions.width = window.innerWidth;
  dimensions.height = window.innerHeight;

  matterInstance.render.canvas.width = dimensions.width;
  matterInstance.render.canvas.height = dimensions.height;
});
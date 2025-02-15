// import React from "@my-react/react";
const jsx = (
  <div>
    Hello World <span key="123">123</span>
  </div>
);

console.log(jsx);

// {
//   "type": "div",
//   "key": null,
//   "ref": null,
//   "props": {
//       "children": [
//           "Hello World ",
//           {
//               "type": "span",
//               "key": "123",
//               "ref": null,
//               "props": {
//                   "children": "123"
//               },
//               "__north_p_bear": true,
//               "__jsx_runtime": "classic"
//           }
//       ]
//   },
//   "__north_p_bear": true,
//   "__jsx_runtime": "classic"
// }

// {
//   "type": "div",
//   "key": null,
//   "ref": null,
//   "props": {
//       "children": [
//           "Hello World ",
//           {
//               "type": "span",
//               "key": "123",
//               "ref": null,
//               "props": {
//                   "children": "123"
//               },
//               "__north_p_bear": true,
//               "__jsx_runtime": "automatic"
//           }
//       ]
//   },
//   "__north_p_bear": true,
//   "__jsx_runtime": "automatic"
// }

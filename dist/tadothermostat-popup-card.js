/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __decorate(decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/**
 * True if the custom elements polyfill is in use.
 */
const isCEPolyfill = typeof window !== 'undefined' && window.customElements != null && window.customElements.polyfillWrapFlushCallback !== undefined;
/**
 * Reparents nodes, starting from `start` (inclusive) to `end` (exclusive),
 * into another container (could be the same container), before `before`. If
 * `before` is null, it appends the nodes to the container.
 */

const reparentNodes = (container, start, end = null, before = null) => {
  while (start !== end) {
    const n = start.nextSibling;
    container.insertBefore(start, before);
    start = n;
  }
};
/**
 * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
 * `container`.
 */

const removeNodes = (container, start, end = null) => {
  while (start !== end) {
    const n = start.nextSibling;
    container.removeChild(start);
    start = n;
  }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * An expression marker used text-positions, multi-binding attributes, and
 * attributes with markup-like text values.
 */

const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * Suffix appended to all bound attribute names.
 */

const boundAttributeSuffix = '$lit$';
/**
 * An updatable Template that tracks the location of dynamic parts.
 */

class Template {
  constructor(result, element) {
    this.parts = [];
    this.element = element;
    const nodesToRemove = [];
    const stack = []; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

    const walker = document.createTreeWalker(element.content, 133
    /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
    , null, false); // Keeps track of the last index associated with a part. We try to delete
    // unnecessary nodes, but we never want to associate two different parts
    // to the same index. They must have a constant node between.

    let lastPartIndex = 0;
    let index = -1;
    let partIndex = 0;
    const {
      strings,
      values: {
        length
      }
    } = result;

    while (partIndex < length) {
      const node = walker.nextNode();

      if (node === null) {
        // We've exhausted the content inside a nested template element.
        // Because we still have parts (the outer for-loop), we know:
        // - There is a template in the stack
        // - The walker will find a nextNode outside the template
        walker.currentNode = stack.pop();
        continue;
      }

      index++;

      if (node.nodeType === 1
      /* Node.ELEMENT_NODE */
      ) {
          if (node.hasAttributes()) {
            const attributes = node.attributes;
            const {
              length
            } = attributes; // Per
            // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
            // attributes are not guaranteed to be returned in document order.
            // In particular, Edge/IE can return them out of order, so we cannot
            // assume a correspondence between part index and attribute index.

            let count = 0;

            for (let i = 0; i < length; i++) {
              if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                count++;
              }
            }

            while (count-- > 0) {
              // Get the template literal section leading up to the first
              // expression in this attribute
              const stringForPart = strings[partIndex]; // Find the attribute name

              const name = lastAttributeNameRegex.exec(stringForPart)[2]; // Find the corresponding attribute
              // All bound attributes have had a suffix added in
              // TemplateResult#getHTML to opt out of special attribute
              // handling. To look up the attribute value we also need to add
              // the suffix.

              const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
              const attributeValue = node.getAttribute(attributeLookupName);
              node.removeAttribute(attributeLookupName);
              const statics = attributeValue.split(markerRegex);
              this.parts.push({
                type: 'attribute',
                index,
                name,
                strings: statics
              });
              partIndex += statics.length - 1;
            }
          }

          if (node.tagName === 'TEMPLATE') {
            stack.push(node);
            walker.currentNode = node.content;
          }
        } else if (node.nodeType === 3
      /* Node.TEXT_NODE */
      ) {
          const data = node.data;

          if (data.indexOf(marker) >= 0) {
            const parent = node.parentNode;
            const strings = data.split(markerRegex);
            const lastIndex = strings.length - 1; // Generate a new text node for each literal section
            // These nodes are also used as the markers for node parts

            for (let i = 0; i < lastIndex; i++) {
              let insert;
              let s = strings[i];

              if (s === '') {
                insert = createMarker();
              } else {
                const match = lastAttributeNameRegex.exec(s);

                if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                  s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                }

                insert = document.createTextNode(s);
              }

              parent.insertBefore(insert, node);
              this.parts.push({
                type: 'node',
                index: ++index
              });
            } // If there's no text, we must insert a comment to mark our place.
            // Else, we can trust it will stick around after cloning.


            if (strings[lastIndex] === '') {
              parent.insertBefore(createMarker(), node);
              nodesToRemove.push(node);
            } else {
              node.data = strings[lastIndex];
            } // We have a part for each match found


            partIndex += lastIndex;
          }
        } else if (node.nodeType === 8
      /* Node.COMMENT_NODE */
      ) {
          if (node.data === marker) {
            const parent = node.parentNode; // Add a new marker node to be the startNode of the Part if any of
            // the following are true:
            //  * We don't have a previousSibling
            //  * The previousSibling is already the start of a previous part

            if (node.previousSibling === null || index === lastPartIndex) {
              index++;
              parent.insertBefore(createMarker(), node);
            }

            lastPartIndex = index;
            this.parts.push({
              type: 'node',
              index
            }); // If we don't have a nextSibling, keep this node so we have an end.
            // Else, we can remove it to save future costs.

            if (node.nextSibling === null) {
              node.data = '';
            } else {
              nodesToRemove.push(node);
              index--;
            }

            partIndex++;
          } else {
            let i = -1;

            while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
              // Comment node has a binding marker inside, make an inactive part
              // The binding won't work, but subsequent bindings will
              // TODO (justinfagnani): consider whether it's even worth it to
              // make bindings in comments work
              this.parts.push({
                type: 'node',
                index: -1
              });
              partIndex++;
            }
          }
        }
    } // Remove text binding nodes after the walk to not disturb the TreeWalker


    for (const n of nodesToRemove) {
      n.parentNode.removeChild(n);
    }
  }

}

const endsWith = (str, suffix) => {
  const index = str.length - suffix.length;
  return index >= 0 && str.slice(index) === suffix;
};

const isTemplatePartActive = part => part.index !== -1; // Allows `document.createComment('')` to be renamed for a
// small manual size-savings.

const createMarker = () => document.createComment('');
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-characters
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
 * space character except " ".
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */

const lastAttributeNameRegex = // eslint-disable-next-line no-control-regex
/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const walkerNodeFilter = 133
/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
;
/**
 * Removes the list of nodes from a Template safely. In addition to removing
 * nodes from the Template, the Template part indices are updated to match
 * the mutated Template DOM.
 *
 * As the template is walked the removal state is tracked and
 * part indices are adjusted as needed.
 *
 * div
 *   div#1 (remove) <-- start removing (removing node is div#1)
 *     div
 *       div#2 (remove)  <-- continue removing (removing node is still div#1)
 *         div
 * div <-- stop removing since previous sibling is the removing node (div#1,
 * removed 4 nodes)
 */

function removeNodesFromTemplate(template, nodesToRemove) {
  const {
    element: {
      content
    },
    parts
  } = template;
  const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
  let partIndex = nextActiveIndexInTemplateParts(parts);
  let part = parts[partIndex];
  let nodeIndex = -1;
  let removeCount = 0;
  const nodesToRemoveInTemplate = [];
  let currentRemovingNode = null;

  while (walker.nextNode()) {
    nodeIndex++;
    const node = walker.currentNode; // End removal if stepped past the removing node

    if (node.previousSibling === currentRemovingNode) {
      currentRemovingNode = null;
    } // A node to remove was found in the template


    if (nodesToRemove.has(node)) {
      nodesToRemoveInTemplate.push(node); // Track node we're removing

      if (currentRemovingNode === null) {
        currentRemovingNode = node;
      }
    } // When removing, increment count by which to adjust subsequent part indices


    if (currentRemovingNode !== null) {
      removeCount++;
    }

    while (part !== undefined && part.index === nodeIndex) {
      // If part is in a removed node deactivate it by setting index to -1 or
      // adjust the index as needed.
      part.index = currentRemovingNode !== null ? -1 : part.index - removeCount; // go to the next active part.

      partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
      part = parts[partIndex];
    }
  }

  nodesToRemoveInTemplate.forEach(n => n.parentNode.removeChild(n));
}

const countNodes = node => {
  let count = node.nodeType === 11
  /* Node.DOCUMENT_FRAGMENT_NODE */
  ? 0 : 1;
  const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);

  while (walker.nextNode()) {
    count++;
  }

  return count;
};

const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
  for (let i = startIndex + 1; i < parts.length; i++) {
    const part = parts[i];

    if (isTemplatePartActive(part)) {
      return i;
    }
  }

  return -1;
};
/**
 * Inserts the given node into the Template, optionally before the given
 * refNode. In addition to inserting the node into the Template, the Template
 * part indices are updated to match the mutated Template DOM.
 */


function insertNodeIntoTemplate(template, node, refNode = null) {
  const {
    element: {
      content
    },
    parts
  } = template; // If there's no refNode, then put node at end of template.
  // No part indices need to be shifted in this case.

  if (refNode === null || refNode === undefined) {
    content.appendChild(node);
    return;
  }

  const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
  let partIndex = nextActiveIndexInTemplateParts(parts);
  let insertCount = 0;
  let walkerIndex = -1;

  while (walker.nextNode()) {
    walkerIndex++;
    const walkerNode = walker.currentNode;

    if (walkerNode === refNode) {
      insertCount = countNodes(node);
      refNode.parentNode.insertBefore(node, refNode);
    }

    while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
      // If we've inserted the node, simply adjust all subsequent parts
      if (insertCount > 0) {
        while (partIndex !== -1) {
          parts[partIndex].index += insertCount;
          partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        }

        return;
      }

      partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
    }
  }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const directives = new WeakMap();
const isDirective = o => {
  return typeof o === 'function' && directives.has(o);
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = {};
/**
 * A sentinel value that signals a NodePart to fully clear its content.
 */

const nothing = {};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */

class TemplateInstance {
  constructor(template, processor, options) {
    this.__parts = [];
    this.template = template;
    this.processor = processor;
    this.options = options;
  }

  update(values) {
    let i = 0;

    for (const part of this.__parts) {
      if (part !== undefined) {
        part.setValue(values[i]);
      }

      i++;
    }

    for (const part of this.__parts) {
      if (part !== undefined) {
        part.commit();
      }
    }
  }

  _clone() {
    // There are a number of steps in the lifecycle of a template instance's
    // DOM fragment:
    //  1. Clone - create the instance fragment
    //  2. Adopt - adopt into the main document
    //  3. Process - find part markers and create parts
    //  4. Upgrade - upgrade custom elements
    //  5. Update - set node, attribute, property, etc., values
    //  6. Connect - connect to the document. Optional and outside of this
    //     method.
    //
    // We have a few constraints on the ordering of these steps:
    //  * We need to upgrade before updating, so that property values will pass
    //    through any property setters.
    //  * We would like to process before upgrading so that we're sure that the
    //    cloned fragment is inert and not disturbed by self-modifying DOM.
    //  * We want custom elements to upgrade even in disconnected fragments.
    //
    // Given these constraints, with full custom elements support we would
    // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
    //
    // But Safari does not implement CustomElementRegistry#upgrade, so we
    // can not implement that order and still have upgrade-before-update and
    // upgrade disconnected fragments. So we instead sacrifice the
    // process-before-upgrade constraint, since in Custom Elements v1 elements
    // must not modify their light DOM in the constructor. We still have issues
    // when co-existing with CEv0 elements like Polymer 1, and with polyfills
    // that don't strictly adhere to the no-modification rule because shadow
    // DOM, which may be created in the constructor, is emulated by being placed
    // in the light DOM.
    //
    // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
    // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
    // in one step.
    //
    // The Custom Elements v1 polyfill supports upgrade(), so the order when
    // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
    // Connect.
    const fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
    const stack = [];
    const parts = this.template.parts; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

    const walker = document.createTreeWalker(fragment, 133
    /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
    , null, false);
    let partIndex = 0;
    let nodeIndex = 0;
    let part;
    let node = walker.nextNode(); // Loop through all the nodes and parts of a template

    while (partIndex < parts.length) {
      part = parts[partIndex];

      if (!isTemplatePartActive(part)) {
        this.__parts.push(undefined);

        partIndex++;
        continue;
      } // Progress the tree walker until we find our next part's node.
      // Note that multiple parts may share the same node (attribute parts
      // on a single element), so this loop may not run at all.


      while (nodeIndex < part.index) {
        nodeIndex++;

        if (node.nodeName === 'TEMPLATE') {
          stack.push(node);
          walker.currentNode = node.content;
        }

        if ((node = walker.nextNode()) === null) {
          // We've exhausted the content inside a nested template element.
          // Because we still have parts (the outer for-loop), we know:
          // - There is a template in the stack
          // - The walker will find a nextNode outside the template
          walker.currentNode = stack.pop();
          node = walker.nextNode();
        }
      } // We've arrived at our part's node.


      if (part.type === 'node') {
        const part = this.processor.handleTextExpression(this.options);
        part.insertAfterNode(node.previousSibling);

        this.__parts.push(part);
      } else {
        this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
      }

      partIndex++;
    }

    if (isCEPolyfill) {
      document.adoptNode(fragment);
      customElements.upgrade(fragment);
    }

    return fragment;
  }

}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Our TrustedTypePolicy for HTML which is declared using the html template
 * tag function.
 *
 * That HTML is a developer-authored constant, and is parsed with innerHTML
 * before any untrusted expressions have been mixed in. Therefor it is
 * considered safe by construction.
 */

const policy = window.trustedTypes && trustedTypes.createPolicy('lit-html', {
  createHTML: s => s
});
const commentMarker = ` ${marker} `;
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */

class TemplateResult {
  constructor(strings, values, type, processor) {
    this.strings = strings;
    this.values = values;
    this.type = type;
    this.processor = processor;
  }
  /**
   * Returns a string of HTML used to create a `<template>` element.
   */


  getHTML() {
    const l = this.strings.length - 1;
    let html = '';
    let isCommentBinding = false;

    for (let i = 0; i < l; i++) {
      const s = this.strings[i]; // For each binding we want to determine the kind of marker to insert
      // into the template source before it's parsed by the browser's HTML
      // parser. The marker type is based on whether the expression is in an
      // attribute, text, or comment position.
      //   * For node-position bindings we insert a comment with the marker
      //     sentinel as its text content, like <!--{{lit-guid}}-->.
      //   * For attribute bindings we insert just the marker sentinel for the
      //     first binding, so that we support unquoted attribute bindings.
      //     Subsequent bindings can use a comment marker because multi-binding
      //     attributes must be quoted.
      //   * For comment bindings we insert just the marker sentinel so we don't
      //     close the comment.
      //
      // The following code scans the template source, but is *not* an HTML
      // parser. We don't need to track the tree structure of the HTML, only
      // whether a binding is inside a comment, and if not, if it appears to be
      // the first binding in an attribute.

      const commentOpen = s.lastIndexOf('<!--'); // We're in comment position if we have a comment open with no following
      // comment close. Because <-- can appear in an attribute value there can
      // be false positives.

      isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf('-->', commentOpen + 1) === -1; // Check to see if we have an attribute-like sequence preceding the
      // expression. This can match "name=value" like structures in text,
      // comments, and attribute values, so there can be false-positives.

      const attributeMatch = lastAttributeNameRegex.exec(s);

      if (attributeMatch === null) {
        // We're only in this branch if we don't have a attribute-like
        // preceding sequence. For comments, this guards against unusual
        // attribute values like <div foo="<!--${'bar'}">. Cases like
        // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
        // below.
        html += s + (isCommentBinding ? commentMarker : nodeMarker);
      } else {
        // For attributes we use just a marker sentinel, and also append a
        // $lit$ suffix to the name to opt-out of attribute-specific parsing
        // that IE and Edge do for style and certain SVG attributes.
        html += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
      }
    }

    html += this.strings[l];
    return html;
  }

  getTemplateElement() {
    const template = document.createElement('template');
    let value = this.getHTML();

    if (policy !== undefined) {
      // this is secure because `this.strings` is a TemplateStringsArray.
      // TODO: validate this when
      // https://github.com/tc39/proposal-array-is-template-object is
      // implemented.
      value = policy.createHTML(value);
    }

    template.innerHTML = value;
    return template;
  }

}
/**
 * A TemplateResult for SVG fragments.
 *
 * This class wraps HTML in an `<svg>` tag in order to parse its contents in the
 * SVG namespace, then modifies the template to remove the `<svg>` tag so that
 * clones only container the original fragment.
 */

class SVGTemplateResult extends TemplateResult {
  getHTML() {
    return `<svg>${super.getHTML()}</svg>`;
  }

  getTemplateElement() {
    const template = super.getTemplateElement();
    const content = template.content;
    const svgElement = content.firstChild;
    content.removeChild(svgElement);
    reparentNodes(content, svgElement.firstChild);
    return template;
  }

}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const isPrimitive = value => {
  return value === null || !(typeof value === 'object' || typeof value === 'function');
};
const isIterable = value => {
  return Array.isArray(value) || // eslint-disable-next-line @typescript-eslint/no-explicit-any
  !!(value && value[Symbol.iterator]);
};
/**
 * Writes attribute values to the DOM for a group of AttributeParts bound to a
 * single attribute. The value is only set once even if there are multiple parts
 * for an attribute.
 */

class AttributeCommitter {
  constructor(element, name, strings) {
    this.dirty = true;
    this.element = element;
    this.name = name;
    this.strings = strings;
    this.parts = [];

    for (let i = 0; i < strings.length - 1; i++) {
      this.parts[i] = this._createPart();
    }
  }
  /**
   * Creates a single part. Override this to create a differnt type of part.
   */


  _createPart() {
    return new AttributePart(this);
  }

  _getValue() {
    const strings = this.strings;
    const l = strings.length - 1;
    const parts = this.parts; // If we're assigning an attribute via syntax like:
    //    attr="${foo}"  or  attr=${foo}
    // but not
    //    attr="${foo} ${bar}" or attr="${foo} baz"
    // then we don't want to coerce the attribute value into one long
    // string. Instead we want to just return the value itself directly,
    // so that sanitizeDOMValue can get the actual value rather than
    // String(value)
    // The exception is if v is an array, in which case we do want to smash
    // it together into a string without calling String() on the array.
    //
    // This also allows trusted values (when using TrustedTypes) being
    // assigned to DOM sinks without being stringified in the process.

    if (l === 1 && strings[0] === '' && strings[1] === '') {
      const v = parts[0].value;

      if (typeof v === 'symbol') {
        return String(v);
      }

      if (typeof v === 'string' || !isIterable(v)) {
        return v;
      }
    }

    let text = '';

    for (let i = 0; i < l; i++) {
      text += strings[i];
      const part = parts[i];

      if (part !== undefined) {
        const v = part.value;

        if (isPrimitive(v) || !isIterable(v)) {
          text += typeof v === 'string' ? v : String(v);
        } else {
          for (const t of v) {
            text += typeof t === 'string' ? t : String(t);
          }
        }
      }
    }

    text += strings[l];
    return text;
  }

  commit() {
    if (this.dirty) {
      this.dirty = false;
      this.element.setAttribute(this.name, this._getValue());
    }
  }

}
/**
 * A Part that controls all or part of an attribute value.
 */

class AttributePart {
  constructor(committer) {
    this.value = undefined;
    this.committer = committer;
  }

  setValue(value) {
    if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
      this.value = value; // If the value is a not a directive, dirty the committer so that it'll
      // call setAttribute. If the value is a directive, it'll dirty the
      // committer if it calls setValue().

      if (!isDirective(value)) {
        this.committer.dirty = true;
      }
    }
  }

  commit() {
    while (isDirective(this.value)) {
      const directive = this.value;
      this.value = noChange;
      directive(this);
    }

    if (this.value === noChange) {
      return;
    }

    this.committer.commit();
  }

}
/**
 * A Part that controls a location within a Node tree. Like a Range, NodePart
 * has start and end locations and can set and update the Nodes between those
 * locations.
 *
 * NodeParts support several value types: primitives, Nodes, TemplateResults,
 * as well as arrays and iterables of those types.
 */

class NodePart {
  constructor(options) {
    this.value = undefined;
    this.__pendingValue = undefined;
    this.options = options;
  }
  /**
   * Appends this part into a container.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  appendInto(container) {
    this.startNode = container.appendChild(createMarker());
    this.endNode = container.appendChild(createMarker());
  }
  /**
   * Inserts this part after the `ref` node (between `ref` and `ref`'s next
   * sibling). Both `ref` and its next sibling must be static, unchanging nodes
   * such as those that appear in a literal section of a template.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  insertAfterNode(ref) {
    this.startNode = ref;
    this.endNode = ref.nextSibling;
  }
  /**
   * Appends this part into a parent part.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  appendIntoPart(part) {
    part.__insert(this.startNode = createMarker());

    part.__insert(this.endNode = createMarker());
  }
  /**
   * Inserts this part after the `ref` part.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  insertAfterPart(ref) {
    ref.__insert(this.startNode = createMarker());

    this.endNode = ref.endNode;
    ref.endNode = this.startNode;
  }

  setValue(value) {
    this.__pendingValue = value;
  }

  commit() {
    if (this.startNode.parentNode === null) {
      return;
    }

    while (isDirective(this.__pendingValue)) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange;
      directive(this);
    }

    const value = this.__pendingValue;

    if (value === noChange) {
      return;
    }

    if (isPrimitive(value)) {
      if (value !== this.value) {
        this.__commitText(value);
      }
    } else if (value instanceof TemplateResult) {
      this.__commitTemplateResult(value);
    } else if (value instanceof Node) {
      this.__commitNode(value);
    } else if (isIterable(value)) {
      this.__commitIterable(value);
    } else if (value === nothing) {
      this.value = nothing;
      this.clear();
    } else {
      // Fallback, will render the string representation
      this.__commitText(value);
    }
  }

  __insert(node) {
    this.endNode.parentNode.insertBefore(node, this.endNode);
  }

  __commitNode(value) {
    if (this.value === value) {
      return;
    }

    this.clear();

    this.__insert(value);

    this.value = value;
  }

  __commitText(value) {
    const node = this.startNode.nextSibling;
    value = value == null ? '' : value; // If `value` isn't already a string, we explicitly convert it here in case
    // it can't be implicitly converted - i.e. it's a symbol.

    const valueAsString = typeof value === 'string' ? value : String(value);

    if (node === this.endNode.previousSibling && node.nodeType === 3
    /* Node.TEXT_NODE */
    ) {
        // If we only have a single text node between the markers, we can just
        // set its value, rather than replacing it.
        // TODO(justinfagnani): Can we just check if this.value is primitive?
        node.data = valueAsString;
      } else {
      this.__commitNode(document.createTextNode(valueAsString));
    }

    this.value = value;
  }

  __commitTemplateResult(value) {
    const template = this.options.templateFactory(value);

    if (this.value instanceof TemplateInstance && this.value.template === template) {
      this.value.update(value.values);
    } else {
      // Make sure we propagate the template processor from the TemplateResult
      // so that we use its syntax extension, etc. The template factory comes
      // from the render function options so that it can control template
      // caching and preprocessing.
      const instance = new TemplateInstance(template, value.processor, this.options);

      const fragment = instance._clone();

      instance.update(value.values);

      this.__commitNode(fragment);

      this.value = instance;
    }
  }

  __commitIterable(value) {
    // For an Iterable, we create a new InstancePart per item, then set its
    // value to the item. This is a little bit of overhead for every item in
    // an Iterable, but it lets us recurse easily and efficiently update Arrays
    // of TemplateResults that will be commonly returned from expressions like:
    // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
    // If _value is an array, then the previous render was of an
    // iterable and _value will contain the NodeParts from the previous
    // render. If _value is not an array, clear this part and make a new
    // array for NodeParts.
    if (!Array.isArray(this.value)) {
      this.value = [];
      this.clear();
    } // Lets us keep track of how many items we stamped so we can clear leftover
    // items from a previous render


    const itemParts = this.value;
    let partIndex = 0;
    let itemPart;

    for (const item of value) {
      // Try to reuse an existing part
      itemPart = itemParts[partIndex]; // If no existing part, create a new one

      if (itemPart === undefined) {
        itemPart = new NodePart(this.options);
        itemParts.push(itemPart);

        if (partIndex === 0) {
          itemPart.appendIntoPart(this);
        } else {
          itemPart.insertAfterPart(itemParts[partIndex - 1]);
        }
      }

      itemPart.setValue(item);
      itemPart.commit();
      partIndex++;
    }

    if (partIndex < itemParts.length) {
      // Truncate the parts array so _value reflects the current state
      itemParts.length = partIndex;
      this.clear(itemPart && itemPart.endNode);
    }
  }

  clear(startNode = this.startNode) {
    removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
  }

}
/**
 * Implements a boolean attribute, roughly as defined in the HTML
 * specification.
 *
 * If the value is truthy, then the attribute is present with a value of
 * ''. If the value is falsey, the attribute is removed.
 */

class BooleanAttributePart {
  constructor(element, name, strings) {
    this.value = undefined;
    this.__pendingValue = undefined;

    if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
      throw new Error('Boolean attributes can only contain a single expression');
    }

    this.element = element;
    this.name = name;
    this.strings = strings;
  }

  setValue(value) {
    this.__pendingValue = value;
  }

  commit() {
    while (isDirective(this.__pendingValue)) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange;
      directive(this);
    }

    if (this.__pendingValue === noChange) {
      return;
    }

    const value = !!this.__pendingValue;

    if (this.value !== value) {
      if (value) {
        this.element.setAttribute(this.name, '');
      } else {
        this.element.removeAttribute(this.name);
      }

      this.value = value;
    }

    this.__pendingValue = noChange;
  }

}
/**
 * Sets attribute values for PropertyParts, so that the value is only set once
 * even if there are multiple parts for a property.
 *
 * If an expression controls the whole property value, then the value is simply
 * assigned to the property under control. If there are string literals or
 * multiple expressions, then the strings are expressions are interpolated into
 * a string first.
 */

class PropertyCommitter extends AttributeCommitter {
  constructor(element, name, strings) {
    super(element, name, strings);
    this.single = strings.length === 2 && strings[0] === '' && strings[1] === '';
  }

  _createPart() {
    return new PropertyPart(this);
  }

  _getValue() {
    if (this.single) {
      return this.parts[0].value;
    }

    return super._getValue();
  }

  commit() {
    if (this.dirty) {
      this.dirty = false; // eslint-disable-next-line @typescript-eslint/no-explicit-any

      this.element[this.name] = this._getValue();
    }
  }

}
class PropertyPart extends AttributePart {} // Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the third
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.

let eventOptionsSupported = false; // Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
// blocks right into the body of a module

(() => {
  try {
    const options = {
      get capture() {
        eventOptionsSupported = true;
        return false;
      }

    }; // eslint-disable-next-line @typescript-eslint/no-explicit-any

    window.addEventListener('test', options, options); // eslint-disable-next-line @typescript-eslint/no-explicit-any

    window.removeEventListener('test', options, options);
  } catch (_e) {// event options not supported
  }
})();

class EventPart {
  constructor(element, eventName, eventContext) {
    this.value = undefined;
    this.__pendingValue = undefined;
    this.element = element;
    this.eventName = eventName;
    this.eventContext = eventContext;

    this.__boundHandleEvent = e => this.handleEvent(e);
  }

  setValue(value) {
    this.__pendingValue = value;
  }

  commit() {
    while (isDirective(this.__pendingValue)) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange;
      directive(this);
    }

    if (this.__pendingValue === noChange) {
      return;
    }

    const newListener = this.__pendingValue;
    const oldListener = this.value;
    const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
    const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);

    if (shouldRemoveListener) {
      this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
    }

    if (shouldAddListener) {
      this.__options = getOptions(newListener);
      this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
    }

    this.value = newListener;
    this.__pendingValue = noChange;
  }

  handleEvent(event) {
    if (typeof this.value === 'function') {
      this.value.call(this.eventContext || this.element, event);
    } else {
      this.value.handleEvent(event);
    }
  }

} // We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.

const getOptions = o => o && (eventOptionsSupported ? {
  capture: o.capture,
  passive: o.passive,
  once: o.once
} : o.capture);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */

function templateFactory(result) {
  let templateCache = templateCaches.get(result.type);

  if (templateCache === undefined) {
    templateCache = {
      stringsArray: new WeakMap(),
      keyString: new Map()
    };
    templateCaches.set(result.type, templateCache);
  }

  let template = templateCache.stringsArray.get(result.strings);

  if (template !== undefined) {
    return template;
  } // If the TemplateStringsArray is new, generate a key from the strings
  // This key is shared between all templates with identical content


  const key = result.strings.join(marker); // Check if we already have a Template for this key

  template = templateCache.keyString.get(key);

  if (template === undefined) {
    // If we have not seen this key before, create a new Template
    template = new Template(result, result.getTemplateElement()); // Cache the Template for this key

    templateCache.keyString.set(key, template);
  } // Cache all future queries for this TemplateStringsArray


  templateCache.stringsArray.set(result.strings, template);
  return template;
}
const templateCaches = new Map();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const parts = new WeakMap();
/**
 * Renders a template result or other value to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result Any value renderable by NodePart - typically a TemplateResult
 *     created by evaluating a template tag like `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */

const render = (result, container, options) => {
  let part = parts.get(container);

  if (part === undefined) {
    removeNodes(container, container.firstChild);
    parts.set(container, part = new NodePart(Object.assign({
      templateFactory
    }, options)));
    part.appendInto(container);
  }

  part.setValue(result);
  part.commit();
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Creates Parts when a template is instantiated.
 */

class DefaultTemplateProcessor {
  /**
   * Create parts for an attribute-position binding, given the event, attribute
   * name, and string literals.
   *
   * @param element The element containing the binding
   * @param name  The attribute name
   * @param strings The string literals. There are always at least two strings,
   *   event for fully-controlled bindings with a single expression.
   */
  handleAttributeExpressions(element, name, strings, options) {
    const prefix = name[0];

    if (prefix === '.') {
      const committer = new PropertyCommitter(element, name.slice(1), strings);
      return committer.parts;
    }

    if (prefix === '@') {
      return [new EventPart(element, name.slice(1), options.eventContext)];
    }

    if (prefix === '?') {
      return [new BooleanAttributePart(element, name.slice(1), strings)];
    }

    const committer = new AttributeCommitter(element, name, strings);
    return committer.parts;
  }
  /**
   * Create parts for a text-position binding.
   * @param templateFactory
   */


  handleTextExpression(options) {
    return new NodePart(options);
  }

}
const defaultTemplateProcessor = new DefaultTemplateProcessor();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time

if (typeof window !== 'undefined') {
  (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.3.0');
}
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */


const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
/**
 * Interprets a template literal as an SVG template that can efficiently
 * render to and update a container.
 */

const svg = (strings, ...values) => new SVGTemplateResult(strings, values, 'svg', defaultTemplateProcessor);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;

let compatibleShadyCSSVersion = true;

if (typeof window.ShadyCSS === 'undefined') {
  compatibleShadyCSSVersion = false;
} else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
  console.warn(`Incompatible ShadyCSS version detected. ` + `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and ` + `@webcomponents/shadycss@1.3.1.`);
  compatibleShadyCSSVersion = false;
}
/**
 * Template factory which scopes template DOM using ShadyCSS.
 * @param scopeName {string}
 */


const shadyTemplateFactory = scopeName => result => {
  const cacheKey = getTemplateCacheKey(result.type, scopeName);
  let templateCache = templateCaches.get(cacheKey);

  if (templateCache === undefined) {
    templateCache = {
      stringsArray: new WeakMap(),
      keyString: new Map()
    };
    templateCaches.set(cacheKey, templateCache);
  }

  let template = templateCache.stringsArray.get(result.strings);

  if (template !== undefined) {
    return template;
  }

  const key = result.strings.join(marker);
  template = templateCache.keyString.get(key);

  if (template === undefined) {
    const element = result.getTemplateElement();

    if (compatibleShadyCSSVersion) {
      window.ShadyCSS.prepareTemplateDom(element, scopeName);
    }

    template = new Template(result, element);
    templateCache.keyString.set(key, template);
  }

  templateCache.stringsArray.set(result.strings, template);
  return template;
};
const TEMPLATE_TYPES = ['html', 'svg'];
/**
 * Removes all style elements from Templates for the given scopeName.
 */

const removeStylesFromLitTemplates = scopeName => {
  TEMPLATE_TYPES.forEach(type => {
    const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));

    if (templates !== undefined) {
      templates.keyString.forEach(template => {
        const {
          element: {
            content
          }
        } = template; // IE 11 doesn't support the iterable param Set constructor

        const styles = new Set();
        Array.from(content.querySelectorAll('style')).forEach(s => {
          styles.add(s);
        });
        removeNodesFromTemplate(template, styles);
      });
    }
  });
};

const shadyRenderSet = new Set();
/**
 * For the given scope name, ensures that ShadyCSS style scoping is performed.
 * This is done just once per scope name so the fragment and template cannot
 * be modified.
 * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
 * to be scoped and appended to the document
 * (2) removes style elements from all lit-html Templates for this scope name.
 *
 * Note, <style> elements can only be placed into templates for the
 * initial rendering of the scope. If <style> elements are included in templates
 * dynamically rendered to the scope (after the first scope render), they will
 * not be scoped and the <style> will be left in the template and rendered
 * output.
 */

const prepareTemplateStyles = (scopeName, renderedDOM, template) => {
  shadyRenderSet.add(scopeName); // If `renderedDOM` is stamped from a Template, then we need to edit that
  // Template's underlying template element. Otherwise, we create one here
  // to give to ShadyCSS, which still requires one while scoping.

  const templateElement = !!template ? template.element : document.createElement('template'); // Move styles out of rendered DOM and store.

  const styles = renderedDOM.querySelectorAll('style');
  const {
    length
  } = styles; // If there are no styles, skip unnecessary work

  if (length === 0) {
    // Ensure prepareTemplateStyles is called to support adding
    // styles via `prepareAdoptedCssText` since that requires that
    // `prepareTemplateStyles` is called.
    //
    // ShadyCSS will only update styles containing @apply in the template
    // given to `prepareTemplateStyles`. If no lit Template was given,
    // ShadyCSS will not be able to update uses of @apply in any relevant
    // template. However, this is not a problem because we only create the
    // template for the purpose of supporting `prepareAdoptedCssText`,
    // which doesn't support @apply at all.
    window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
    return;
  }

  const condensedStyle = document.createElement('style'); // Collect styles into a single style. This helps us make sure ShadyCSS
  // manipulations will not prevent us from being able to fix up template
  // part indices.
  // NOTE: collecting styles is inefficient for browsers but ShadyCSS
  // currently does this anyway. When it does not, this should be changed.

  for (let i = 0; i < length; i++) {
    const style = styles[i];
    style.parentNode.removeChild(style);
    condensedStyle.textContent += style.textContent;
  } // Remove styles from nested templates in this scope.


  removeStylesFromLitTemplates(scopeName); // And then put the condensed style into the "root" template passed in as
  // `template`.

  const content = templateElement.content;

  if (!!template) {
    insertNodeIntoTemplate(template, condensedStyle, content.firstChild);
  } else {
    content.insertBefore(condensedStyle, content.firstChild);
  } // Note, it's important that ShadyCSS gets the template that `lit-html`
  // will actually render so that it can update the style inside when
  // needed (e.g. @apply native Shadow DOM case).


  window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
  const style = content.querySelector('style');

  if (window.ShadyCSS.nativeShadow && style !== null) {
    // When in native Shadow DOM, ensure the style created by ShadyCSS is
    // included in initially rendered output (`renderedDOM`).
    renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
  } else if (!!template) {
    // When no style is left in the template, parts will be broken as a
    // result. To fix this, we put back the style node ShadyCSS removed
    // and then tell lit to remove that node from the template.
    // There can be no style in the template in 2 cases (1) when Shady DOM
    // is in use, ShadyCSS removes all styles, (2) when native Shadow DOM
    // is in use ShadyCSS removes the style if it contains no content.
    // NOTE, ShadyCSS creates its own style so we can safely add/remove
    // `condensedStyle` here.
    content.insertBefore(condensedStyle, content.firstChild);
    const removes = new Set();
    removes.add(condensedStyle);
    removeNodesFromTemplate(template, removes);
  }
};
/**
 * Extension to the standard `render` method which supports rendering
 * to ShadowRoots when the ShadyDOM (https://github.com/webcomponents/shadydom)
 * and ShadyCSS (https://github.com/webcomponents/shadycss) polyfills are used
 * or when the webcomponentsjs
 * (https://github.com/webcomponents/webcomponentsjs) polyfill is used.
 *
 * Adds a `scopeName` option which is used to scope element DOM and stylesheets
 * when native ShadowDOM is unavailable. The `scopeName` will be added to
 * the class attribute of all rendered DOM. In addition, any style elements will
 * be automatically re-written with this `scopeName` selector and moved out
 * of the rendered DOM and into the document `<head>`.
 *
 * It is common to use this render method in conjunction with a custom element
 * which renders a shadowRoot. When this is done, typically the element's
 * `localName` should be used as the `scopeName`.
 *
 * In addition to DOM scoping, ShadyCSS also supports a basic shim for css
 * custom properties (needed only on older browsers like IE11) and a shim for
 * a deprecated feature called `@apply` that supports applying a set of css
 * custom properties to a given location.
 *
 * Usage considerations:
 *
 * * Part values in `<style>` elements are only applied the first time a given
 * `scopeName` renders. Subsequent changes to parts in style elements will have
 * no effect. Because of this, parts in style elements should only be used for
 * values that will never change, for example parts that set scope-wide theme
 * values or parts which render shared style elements.
 *
 * * Note, due to a limitation of the ShadyDOM polyfill, rendering in a
 * custom element's `constructor` is not supported. Instead rendering should
 * either done asynchronously, for example at microtask timing (for example
 * `Promise.resolve()`), or be deferred until the first time the element's
 * `connectedCallback` runs.
 *
 * Usage considerations when using shimmed custom properties or `@apply`:
 *
 * * Whenever any dynamic changes are made which affect
 * css custom properties, `ShadyCSS.styleElement(element)` must be called
 * to update the element. There are two cases when this is needed:
 * (1) the element is connected to a new parent, (2) a class is added to the
 * element that causes it to match different custom properties.
 * To address the first case when rendering a custom element, `styleElement`
 * should be called in the element's `connectedCallback`.
 *
 * * Shimmed custom properties may only be defined either for an entire
 * shadowRoot (for example, in a `:host` rule) or via a rule that directly
 * matches an element with a shadowRoot. In other words, instead of flowing from
 * parent to child as do native css custom properties, shimmed custom properties
 * flow only from shadowRoots to nested shadowRoots.
 *
 * * When using `@apply` mixing css shorthand property names with
 * non-shorthand names (for example `border` and `border-width`) is not
 * supported.
 */


const render$1 = (result, container, options) => {
  if (!options || typeof options !== 'object' || !options.scopeName) {
    throw new Error('The `scopeName` option is required.');
  }

  const scopeName = options.scopeName;
  const hasRendered = parts.has(container);
  const needsScoping = compatibleShadyCSSVersion && container.nodeType === 11
  /* Node.DOCUMENT_FRAGMENT_NODE */
  && !!container.host; // Handle first render to a scope specially...

  const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName); // On first scope render, render into a fragment; this cannot be a single
  // fragment that is reused since nested renders can occur synchronously.

  const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
  render(result, renderContainer, Object.assign({
    templateFactory: shadyTemplateFactory(scopeName)
  }, options)); // When performing first scope render,
  // (1) We've rendered into a fragment so that there's a chance to
  // `prepareTemplateStyles` before sub-elements hit the DOM
  // (which might cause them to render based on a common pattern of
  // rendering in a custom element's `connectedCallback`);
  // (2) Scope the template with ShadyCSS one time only for this scope.
  // (3) Render the fragment into the container and make sure the
  // container knows its `part` is the one we just rendered. This ensures
  // DOM will be re-used on subsequent renders.

  if (firstScopeRender) {
    const part = parts.get(renderContainer);
    parts.delete(renderContainer); // ShadyCSS might have style sheets (e.g. from `prepareAdoptedCssText`)
    // that should apply to `renderContainer` even if the rendered value is
    // not a TemplateInstance. However, it will only insert scoped styles
    // into the document if `prepareTemplateStyles` has already been called
    // for the given scope name.

    const template = part.value instanceof TemplateInstance ? part.value.template : undefined;
    prepareTemplateStyles(scopeName, renderContainer, template);
    removeNodes(container, container.firstChild);
    container.appendChild(renderContainer);
    parts.set(container, part);
  } // After elements have hit the DOM, update styling if this is the
  // initial render to this container.
  // This is needed whenever dynamic changes are made so it would be
  // safest to do every render; however, this would regress performance
  // so we leave it up to the user to call `ShadyCSS.styleElement`
  // for dynamic changes.


  if (!hasRendered && needsScoping) {
    window.ShadyCSS.styleElement(container.host);
  }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var _a;
/**
 * Use this module if you want to create your own base class extending
 * [[UpdatingElement]].
 * @packageDocumentation
 */

/*
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
 * replaced at compile time by the munged name for object[property]. We cannot
 * alias this function, so we have to use a small shim that has the same
 * behavior when not compiling.
 */


window.JSCompiler_renameProperty = (prop, _obj) => prop;

const defaultConverter = {
  toAttribute(value, type) {
    switch (type) {
      case Boolean:
        return value ? '' : null;

      case Object:
      case Array:
        // if the value is `null` or `undefined` pass this through
        // to allow removing/no change behavior.
        return value == null ? value : JSON.stringify(value);
    }

    return value;
  },

  fromAttribute(value, type) {
    switch (type) {
      case Boolean:
        return value !== null;

      case Number:
        return value === null ? null : Number(value);

      case Object:
      case Array:
        return JSON.parse(value);
    }

    return value;
  }

};
/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 */

const notEqual = (value, old) => {
  // This ensures (old==NaN, value==NaN) always returns false
  return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
  attribute: true,
  type: String,
  converter: defaultConverter,
  reflect: false,
  hasChanged: notEqual
};
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
/**
 * The Closure JS Compiler doesn't currently have good support for static
 * property semantics where "this" is dynamic (e.g.
 * https://github.com/google/closure-compiler/issues/3177 and others) so we use
 * this hack to bypass any rewriting by the compiler.
 */

const finalized = 'finalized';
/**
 * Base element class which manages element properties and attributes. When
 * properties change, the `update` method is asynchronously called. This method
 * should be supplied by subclassers to render updates as desired.
 * @noInheritDoc
 */

class UpdatingElement extends HTMLElement {
  constructor() {
    super();
    this.initialize();
  }
  /**
   * Returns a list of attributes corresponding to the registered properties.
   * @nocollapse
   */


  static get observedAttributes() {
    // note: piggy backing on this to ensure we're finalized.
    this.finalize();
    const attributes = []; // Use forEach so this works even if for/of loops are compiled to for loops
    // expecting arrays

    this._classProperties.forEach((v, p) => {
      const attr = this._attributeNameForProperty(p, v);

      if (attr !== undefined) {
        this._attributeToPropertyMap.set(attr, p);

        attributes.push(attr);
      }
    });

    return attributes;
  }
  /**
   * Ensures the private `_classProperties` property metadata is created.
   * In addition to `finalize` this is also called in `createProperty` to
   * ensure the `@property` decorator can add property metadata.
   */

  /** @nocollapse */


  static _ensureClassProperties() {
    // ensure private storage for property declarations.
    if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
      this._classProperties = new Map(); // NOTE: Workaround IE11 not supporting Map constructor argument.

      const superProperties = Object.getPrototypeOf(this)._classProperties;

      if (superProperties !== undefined) {
        superProperties.forEach((v, k) => this._classProperties.set(k, v));
      }
    }
  }
  /**
   * Creates a property accessor on the element prototype if one does not exist
   * and stores a PropertyDeclaration for the property with the given options.
   * The property setter calls the property's `hasChanged` property option
   * or uses a strict identity check to determine whether or not to request
   * an update.
   *
   * This method may be overridden to customize properties; however,
   * when doing so, it's important to call `super.createProperty` to ensure
   * the property is setup correctly. This method calls
   * `getPropertyDescriptor` internally to get a descriptor to install.
   * To customize what properties do when they are get or set, override
   * `getPropertyDescriptor`. To customize the options for a property,
   * implement `createProperty` like this:
   *
   * static createProperty(name, options) {
   *   options = Object.assign(options, {myOption: true});
   *   super.createProperty(name, options);
   * }
   *
   * @nocollapse
   */


  static createProperty(name, options = defaultPropertyDeclaration) {
    // Note, since this can be called by the `@property` decorator which
    // is called before `finalize`, we ensure storage exists for property
    // metadata.
    this._ensureClassProperties();

    this._classProperties.set(name, options); // Do not generate an accessor if the prototype already has one, since
    // it would be lost otherwise and that would never be the user's intention;
    // Instead, we expect users to call `requestUpdate` themselves from
    // user-defined accessors. Note that if the super has an accessor we will
    // still overwrite it


    if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
      return;
    }

    const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
    const descriptor = this.getPropertyDescriptor(name, key, options);

    if (descriptor !== undefined) {
      Object.defineProperty(this.prototype, name, descriptor);
    }
  }
  /**
   * Returns a property descriptor to be defined on the given named property.
   * If no descriptor is returned, the property will not become an accessor.
   * For example,
   *
   *   class MyElement extends LitElement {
   *     static getPropertyDescriptor(name, key, options) {
   *       const defaultDescriptor =
   *           super.getPropertyDescriptor(name, key, options);
   *       const setter = defaultDescriptor.set;
   *       return {
   *         get: defaultDescriptor.get,
   *         set(value) {
   *           setter.call(this, value);
   *           // custom action.
   *         },
   *         configurable: true,
   *         enumerable: true
   *       }
   *     }
   *   }
   *
   * @nocollapse
   */


  static getPropertyDescriptor(name, key, options) {
    return {
      // tslint:disable-next-line:no-any no symbol in index
      get() {
        return this[key];
      },

      set(value) {
        const oldValue = this[name];
        this[key] = value;
        this.requestUpdateInternal(name, oldValue, options);
      },

      configurable: true,
      enumerable: true
    };
  }
  /**
   * Returns the property options associated with the given property.
   * These options are defined with a PropertyDeclaration via the `properties`
   * object or the `@property` decorator and are registered in
   * `createProperty(...)`.
   *
   * Note, this method should be considered "final" and not overridden. To
   * customize the options for a given property, override `createProperty`.
   *
   * @nocollapse
   * @final
   */


  static getPropertyOptions(name) {
    return this._classProperties && this._classProperties.get(name) || defaultPropertyDeclaration;
  }
  /**
   * Creates property accessors for registered properties and ensures
   * any superclasses are also finalized.
   * @nocollapse
   */


  static finalize() {
    // finalize any superclasses
    const superCtor = Object.getPrototypeOf(this);

    if (!superCtor.hasOwnProperty(finalized)) {
      superCtor.finalize();
    }

    this[finalized] = true;

    this._ensureClassProperties(); // initialize Map populated in observedAttributes


    this._attributeToPropertyMap = new Map(); // make any properties
    // Note, only process "own" properties since this element will inherit
    // any properties defined on the superClass, and finalization ensures
    // the entire prototype chain is finalized.

    if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
      const props = this.properties; // support symbols in properties (IE11 does not support this)

      const propKeys = [...Object.getOwnPropertyNames(props), ...(typeof Object.getOwnPropertySymbols === 'function' ? Object.getOwnPropertySymbols(props) : [])]; // This for/of is ok because propKeys is an array

      for (const p of propKeys) {
        // note, use of `any` is due to TypeSript lack of support for symbol in
        // index types
        // tslint:disable-next-line:no-any no symbol in index
        this.createProperty(p, props[p]);
      }
    }
  }
  /**
   * Returns the property name for the given attribute `name`.
   * @nocollapse
   */


  static _attributeNameForProperty(name, options) {
    const attribute = options.attribute;
    return attribute === false ? undefined : typeof attribute === 'string' ? attribute : typeof name === 'string' ? name.toLowerCase() : undefined;
  }
  /**
   * Returns true if a property should request an update.
   * Called when a property value is set and uses the `hasChanged`
   * option for the property if present or a strict identity check.
   * @nocollapse
   */


  static _valueHasChanged(value, old, hasChanged = notEqual) {
    return hasChanged(value, old);
  }
  /**
   * Returns the property value for the given attribute value.
   * Called via the `attributeChangedCallback` and uses the property's
   * `converter` or `converter.fromAttribute` property option.
   * @nocollapse
   */


  static _propertyValueFromAttribute(value, options) {
    const type = options.type;
    const converter = options.converter || defaultConverter;
    const fromAttribute = typeof converter === 'function' ? converter : converter.fromAttribute;
    return fromAttribute ? fromAttribute(value, type) : value;
  }
  /**
   * Returns the attribute value for the given property value. If this
   * returns undefined, the property will *not* be reflected to an attribute.
   * If this returns null, the attribute will be removed, otherwise the
   * attribute will be set to the value.
   * This uses the property's `reflect` and `type.toAttribute` property options.
   * @nocollapse
   */


  static _propertyValueToAttribute(value, options) {
    if (options.reflect === undefined) {
      return;
    }

    const type = options.type;
    const converter = options.converter;
    const toAttribute = converter && converter.toAttribute || defaultConverter.toAttribute;
    return toAttribute(value, type);
  }
  /**
   * Performs element initialization. By default captures any pre-set values for
   * registered properties.
   */


  initialize() {
    this._updateState = 0;
    this._updatePromise = new Promise(res => this._enableUpdatingResolver = res);
    this._changedProperties = new Map();

    this._saveInstanceProperties(); // ensures first update will be caught by an early access of
    // `updateComplete`


    this.requestUpdateInternal();
  }
  /**
   * Fixes any properties set on the instance before upgrade time.
   * Otherwise these would shadow the accessor and break these properties.
   * The properties are stored in a Map which is played back after the
   * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
   * (<=41), properties created for native platform properties like (`id` or
   * `name`) may not have default values set in the element constructor. On
   * these browsers native properties appear on instances and therefore their
   * default value will overwrite any element default (e.g. if the element sets
   * this.id = 'id' in the constructor, the 'id' will become '' since this is
   * the native platform default).
   */


  _saveInstanceProperties() {
    // Use forEach so this works even if for/of loops are compiled to for loops
    // expecting arrays
    this.constructor._classProperties.forEach((_v, p) => {
      if (this.hasOwnProperty(p)) {
        const value = this[p];
        delete this[p];

        if (!this._instanceProperties) {
          this._instanceProperties = new Map();
        }

        this._instanceProperties.set(p, value);
      }
    });
  }
  /**
   * Applies previously saved instance properties.
   */


  _applyInstanceProperties() {
    // Use forEach so this works even if for/of loops are compiled to for loops
    // expecting arrays
    // tslint:disable-next-line:no-any
    this._instanceProperties.forEach((v, p) => this[p] = v);

    this._instanceProperties = undefined;
  }

  connectedCallback() {
    // Ensure first connection completes an update. Updates cannot complete
    // before connection.
    this.enableUpdating();
  }

  enableUpdating() {
    if (this._enableUpdatingResolver !== undefined) {
      this._enableUpdatingResolver();

      this._enableUpdatingResolver = undefined;
    }
  }
  /**
   * Allows for `super.disconnectedCallback()` in extensions while
   * reserving the possibility of making non-breaking feature additions
   * when disconnecting at some point in the future.
   */


  disconnectedCallback() {}
  /**
   * Synchronizes property values when attributes change.
   */


  attributeChangedCallback(name, old, value) {
    if (old !== value) {
      this._attributeToProperty(name, value);
    }
  }

  _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
    const ctor = this.constructor;

    const attr = ctor._attributeNameForProperty(name, options);

    if (attr !== undefined) {
      const attrValue = ctor._propertyValueToAttribute(value, options); // an undefined value does not change the attribute.


      if (attrValue === undefined) {
        return;
      } // Track if the property is being reflected to avoid
      // setting the property again via `attributeChangedCallback`. Note:
      // 1. this takes advantage of the fact that the callback is synchronous.
      // 2. will behave incorrectly if multiple attributes are in the reaction
      // stack at time of calling. However, since we process attributes
      // in `update` this should not be possible (or an extreme corner case
      // that we'd like to discover).
      // mark state reflecting


      this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;

      if (attrValue == null) {
        this.removeAttribute(attr);
      } else {
        this.setAttribute(attr, attrValue);
      } // mark state not reflecting


      this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
    }
  }

  _attributeToProperty(name, value) {
    // Use tracking info to avoid deserializing attribute value if it was
    // just set from a property setter.
    if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
      return;
    }

    const ctor = this.constructor; // Note, hint this as an `AttributeMap` so closure clearly understands
    // the type; it has issues with tracking types through statics
    // tslint:disable-next-line:no-unnecessary-type-assertion

    const propName = ctor._attributeToPropertyMap.get(name);

    if (propName !== undefined) {
      const options = ctor.getPropertyOptions(propName); // mark state reflecting

      this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
      this[propName] = // tslint:disable-next-line:no-any
      ctor._propertyValueFromAttribute(value, options); // mark state not reflecting

      this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
    }
  }
  /**
   * This protected version of `requestUpdate` does not access or return the
   * `updateComplete` promise. This promise can be overridden and is therefore
   * not free to access.
   */


  requestUpdateInternal(name, oldValue, options) {
    let shouldRequestUpdate = true; // If we have a property key, perform property update steps.

    if (name !== undefined) {
      const ctor = this.constructor;
      options = options || ctor.getPropertyOptions(name);

      if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
        if (!this._changedProperties.has(name)) {
          this._changedProperties.set(name, oldValue);
        } // Add to reflecting properties set.
        // Note, it's important that every change has a chance to add the
        // property to `_reflectingProperties`. This ensures setting
        // attribute + property reflects correctly.


        if (options.reflect === true && !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
          if (this._reflectingProperties === undefined) {
            this._reflectingProperties = new Map();
          }

          this._reflectingProperties.set(name, options);
        }
      } else {
        // Abort the request if the property should not be considered changed.
        shouldRequestUpdate = false;
      }
    }

    if (!this._hasRequestedUpdate && shouldRequestUpdate) {
      this._updatePromise = this._enqueueUpdate();
    }
  }
  /**
   * Requests an update which is processed asynchronously. This should
   * be called when an element should update based on some state not triggered
   * by setting a property. In this case, pass no arguments. It should also be
   * called when manually implementing a property setter. In this case, pass the
   * property `name` and `oldValue` to ensure that any configured property
   * options are honored. Returns the `updateComplete` Promise which is resolved
   * when the update completes.
   *
   * @param name {PropertyKey} (optional) name of requesting property
   * @param oldValue {any} (optional) old value of requesting property
   * @returns {Promise} A Promise that is resolved when the update completes.
   */


  requestUpdate(name, oldValue) {
    this.requestUpdateInternal(name, oldValue);
    return this.updateComplete;
  }
  /**
   * Sets up the element to asynchronously update.
   */


  async _enqueueUpdate() {
    this._updateState = this._updateState | STATE_UPDATE_REQUESTED;

    try {
      // Ensure any previous update has resolved before updating.
      // This `await` also ensures that property changes are batched.
      await this._updatePromise;
    } catch (e) {// Ignore any previous errors. We only care that the previous cycle is
      // done. Any error should have been handled in the previous update.
    }

    const result = this.performUpdate(); // If `performUpdate` returns a Promise, we await it. This is done to
    // enable coordinating updates with a scheduler. Note, the result is
    // checked to avoid delaying an additional microtask unless we need to.

    if (result != null) {
      await result;
    }

    return !this._hasRequestedUpdate;
  }

  get _hasRequestedUpdate() {
    return this._updateState & STATE_UPDATE_REQUESTED;
  }

  get hasUpdated() {
    return this._updateState & STATE_HAS_UPDATED;
  }
  /**
   * Performs an element update. Note, if an exception is thrown during the
   * update, `firstUpdated` and `updated` will not be called.
   *
   * You can override this method to change the timing of updates. If this
   * method is overridden, `super.performUpdate()` must be called.
   *
   * For instance, to schedule updates to occur just before the next frame:
   *
   * ```
   * protected async performUpdate(): Promise<unknown> {
   *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
   *   super.performUpdate();
   * }
   * ```
   */


  performUpdate() {
    // Abort any update if one is not pending when this is called.
    // This can happen if `performUpdate` is called early to "flush"
    // the update.
    if (!this._hasRequestedUpdate) {
      return;
    } // Mixin instance properties once, if they exist.


    if (this._instanceProperties) {
      this._applyInstanceProperties();
    }

    let shouldUpdate = false;
    const changedProperties = this._changedProperties;

    try {
      shouldUpdate = this.shouldUpdate(changedProperties);

      if (shouldUpdate) {
        this.update(changedProperties);
      } else {
        this._markUpdated();
      }
    } catch (e) {
      // Prevent `firstUpdated` and `updated` from running when there's an
      // update exception.
      shouldUpdate = false; // Ensure element can accept additional updates after an exception.

      this._markUpdated();

      throw e;
    }

    if (shouldUpdate) {
      if (!(this._updateState & STATE_HAS_UPDATED)) {
        this._updateState = this._updateState | STATE_HAS_UPDATED;
        this.firstUpdated(changedProperties);
      }

      this.updated(changedProperties);
    }
  }

  _markUpdated() {
    this._changedProperties = new Map();
    this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
  }
  /**
   * Returns a Promise that resolves when the element has completed updating.
   * The Promise value is a boolean that is `true` if the element completed the
   * update without triggering another update. The Promise result is `false` if
   * a property was set inside `updated()`. If the Promise is rejected, an
   * exception was thrown during the update.
   *
   * To await additional asynchronous work, override the `_getUpdateComplete`
   * method. For example, it is sometimes useful to await a rendered element
   * before fulfilling this Promise. To do this, first await
   * `super._getUpdateComplete()`, then any subsequent state.
   *
   * @returns {Promise} The Promise returns a boolean that indicates if the
   * update resolved without triggering another update.
   */


  get updateComplete() {
    return this._getUpdateComplete();
  }
  /**
   * Override point for the `updateComplete` promise.
   *
   * It is not safe to override the `updateComplete` getter directly due to a
   * limitation in TypeScript which means it is not possible to call a
   * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
   * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
   * This method should be overridden instead. For example:
   *
   *   class MyElement extends LitElement {
   *     async _getUpdateComplete() {
   *       await super._getUpdateComplete();
   *       await this._myChild.updateComplete;
   *     }
   *   }
   */


  _getUpdateComplete() {
    return this._updatePromise;
  }
  /**
   * Controls whether or not `update` should be called when the element requests
   * an update. By default, this method always returns `true`, but this can be
   * customized to control when to update.
   *
   * @param _changedProperties Map of changed properties with old values
   */


  shouldUpdate(_changedProperties) {
    return true;
  }
  /**
   * Updates the element. This method reflects property values to attributes.
   * It can be overridden to render and keep updated element DOM.
   * Setting properties inside this method will *not* trigger
   * another update.
   *
   * @param _changedProperties Map of changed properties with old values
   */


  update(_changedProperties) {
    if (this._reflectingProperties !== undefined && this._reflectingProperties.size > 0) {
      // Use forEach so this works even if for/of loops are compiled to for
      // loops expecting arrays
      this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));

      this._reflectingProperties = undefined;
    }

    this._markUpdated();
  }
  /**
   * Invoked whenever the element is updated. Implement to perform
   * post-updating tasks via DOM APIs, for example, focusing an element.
   *
   * Setting properties inside this method will trigger the element to update
   * again after this update cycle completes.
   *
   * @param _changedProperties Map of changed properties with old values
   */


  updated(_changedProperties) {}
  /**
   * Invoked when the element is first updated. Implement to perform one time
   * work on the element after update.
   *
   * Setting properties inside this method will trigger the element to update
   * again after this update cycle completes.
   *
   * @param _changedProperties Map of changed properties with old values
   */


  firstUpdated(_changedProperties) {}

}
_a = finalized;
/**
 * Marks class as having finished creating properties.
 */

UpdatingElement[_a] = true;

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const legacyCustomElement = (tagName, clazz) => {
  window.customElements.define(tagName, clazz); // Cast as any because TS doesn't recognize the return type as being a
  // subtype of the decorated class when clazz is typed as
  // `Constructor<HTMLElement>` for some reason.
  // `Constructor<HTMLElement>` is helpful to make sure the decorator is
  // applied to elements however.
  // tslint:disable-next-line:no-any

  return clazz;
};

const standardCustomElement = (tagName, descriptor) => {
  const {
    kind,
    elements
  } = descriptor;
  return {
    kind,
    elements,

    // This callback is called once the class is otherwise fully defined
    finisher(clazz) {
      window.customElements.define(tagName, clazz);
    }

  };
};
/**
 * Class decorator factory that defines the decorated class as a custom element.
 *
 * ```
 * @customElement('my-element')
 * class MyElement {
 *   render() {
 *     return html``;
 *   }
 * }
 * ```
 * @category Decorator
 * @param tagName The name of the custom element to define.
 */


const customElement = tagName => classOrDescriptor => typeof classOrDescriptor === 'function' ? legacyCustomElement(tagName, classOrDescriptor) : standardCustomElement(tagName, classOrDescriptor);

const standardProperty = (options, element) => {
  // When decorating an accessor, pass it through and add property metadata.
  // Note, the `hasOwnProperty` check in `createProperty` ensures we don't
  // stomp over the user's accessor.
  if (element.kind === 'method' && element.descriptor && !('value' in element.descriptor)) {
    return Object.assign(Object.assign({}, element), {
      finisher(clazz) {
        clazz.createProperty(element.key, options);
      }

    });
  } else {
    // createProperty() takes care of defining the property, but we still
    // must return some kind of descriptor, so return a descriptor for an
    // unused prototype field. The finisher calls createProperty().
    return {
      kind: 'field',
      key: Symbol(),
      placement: 'own',
      descriptor: {},

      // When @babel/plugin-proposal-decorators implements initializers,
      // do this instead of the initializer below. See:
      // https://github.com/babel/babel/issues/9260 extras: [
      //   {
      //     kind: 'initializer',
      //     placement: 'own',
      //     initializer: descriptor.initializer,
      //   }
      // ],
      initializer() {
        if (typeof element.initializer === 'function') {
          this[element.key] = element.initializer.call(this);
        }
      },

      finisher(clazz) {
        clazz.createProperty(element.key, options);
      }

    };
  }
};

const legacyProperty = (options, proto, name) => {
  proto.constructor.createProperty(name, options);
};
/**
 * A property decorator which creates a LitElement property which reflects a
 * corresponding attribute value. A [[`PropertyDeclaration`]] may optionally be
 * supplied to configure property features.
 *
 * This decorator should only be used for public fields. Private or protected
 * fields should use the [[`internalProperty`]] decorator.
 *
 * @example
 * ```ts
 * class MyElement {
 *   @property({ type: Boolean })
 *   clicked = false;
 * }
 * ```
 * @category Decorator
 * @ExportDecoratedItems
 */


function property(options) {
  // tslint:disable-next-line:no-any decorator
  return (protoOrDescriptor, name) => name !== undefined ? legacyProperty(options, protoOrDescriptor, name) : standardProperty(options, protoOrDescriptor);
}

/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/

/**
 * Whether the current browser supports `adoptedStyleSheets`.
 */
const supportsAdoptingStyleSheets = window.ShadowRoot && (window.ShadyCSS === undefined || window.ShadyCSS.nativeShadow) && 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype;
const constructionToken = Symbol();
class CSSResult {
  constructor(cssText, safeToken) {
    if (safeToken !== constructionToken) {
      throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
    }

    this.cssText = cssText;
  } // Note, this is a getter so that it's lazy. In practice, this means
  // stylesheets are not created until the first element instance is made.


  get styleSheet() {
    if (this._styleSheet === undefined) {
      // Note, if `supportsAdoptingStyleSheets` is true then we assume
      // CSSStyleSheet is constructable.
      if (supportsAdoptingStyleSheets) {
        this._styleSheet = new CSSStyleSheet();

        this._styleSheet.replaceSync(this.cssText);
      } else {
        this._styleSheet = null;
      }
    }

    return this._styleSheet;
  }

  toString() {
    return this.cssText;
  }

}
/**
 * Wrap a value for interpolation in a [[`css`]] tagged template literal.
 *
 * This is unsafe because untrusted CSS text can be used to phone home
 * or exfiltrate data to an attacker controlled site. Take care to only use
 * this with trusted input.
 */

const unsafeCSS = value => {
  return new CSSResult(String(value), constructionToken);
};

const textFromCSSResult = value => {
  if (value instanceof CSSResult) {
    return value.cssText;
  } else if (typeof value === 'number') {
    return value;
  } else {
    throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`);
  }
};
/**
 * Template tag which which can be used with LitElement's [[LitElement.styles |
 * `styles`]] property to set element styles. For security reasons, only literal
 * string values may be used. To incorporate non-literal values [[`unsafeCSS`]]
 * may be used inside a template string part.
 */


const css = (strings, ...values) => {
  const cssText = values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
  return new CSSResult(cssText, constructionToken);
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// This line will be used in regexes to search for LitElement usage.
// TODO(justinfagnani): inject version number at build time

(window['litElementVersions'] || (window['litElementVersions'] = [])).push('2.4.0');
/**
 * Sentinal value used to avoid calling lit-html's render function when
 * subclasses do not implement `render`
 */

const renderNotImplemented = {};
/**
 * Base element class that manages element properties and attributes, and
 * renders a lit-html template.
 *
 * To define a component, subclass `LitElement` and implement a
 * `render` method to provide the component's template. Define properties
 * using the [[`properties`]] property or the [[`property`]] decorator.
 */

class LitElement extends UpdatingElement {
  /**
   * Return the array of styles to apply to the element.
   * Override this method to integrate into a style management system.
   *
   * @nocollapse
   */
  static getStyles() {
    return this.styles;
  }
  /** @nocollapse */


  static _getUniqueStyles() {
    // Only gather styles once per class
    if (this.hasOwnProperty(JSCompiler_renameProperty('_styles', this))) {
      return;
    } // Take care not to call `this.getStyles()` multiple times since this
    // generates new CSSResults each time.
    // TODO(sorvell): Since we do not cache CSSResults by input, any
    // shared styles will generate new stylesheet objects, which is wasteful.
    // This should be addressed when a browser ships constructable
    // stylesheets.


    const userStyles = this.getStyles();

    if (Array.isArray(userStyles)) {
      // De-duplicate styles preserving the _last_ instance in the set.
      // This is a performance optimization to avoid duplicated styles that can
      // occur especially when composing via subclassing.
      // The last item is kept to try to preserve the cascade order with the
      // assumption that it's most important that last added styles override
      // previous styles.
      const addStyles = (styles, set) => styles.reduceRight((set, s) => // Note: On IE set.add() does not return the set
      Array.isArray(s) ? addStyles(s, set) : (set.add(s), set), set); // Array.from does not work on Set in IE, otherwise return
      // Array.from(addStyles(userStyles, new Set<CSSResult>())).reverse()


      const set = addStyles(userStyles, new Set());
      const styles = [];
      set.forEach(v => styles.unshift(v));
      this._styles = styles;
    } else {
      this._styles = userStyles === undefined ? [] : [userStyles];
    } // Ensure that there are no invalid CSSStyleSheet instances here. They are
    // invalid in two conditions.
    // (1) the sheet is non-constructible (`sheet` of a HTMLStyleElement), but
    //     this is impossible to check except via .replaceSync or use
    // (2) the ShadyCSS polyfill is enabled (:. supportsAdoptingStyleSheets is
    //     false)


    this._styles = this._styles.map(s => {
      if (s instanceof CSSStyleSheet && !supportsAdoptingStyleSheets) {
        // Flatten the cssText from the passed constructible stylesheet (or
        // undetectable non-constructible stylesheet). The user might have
        // expected to update their stylesheets over time, but the alternative
        // is a crash.
        const cssText = Array.prototype.slice.call(s.cssRules).reduce((css, rule) => css + rule.cssText, '');
        return unsafeCSS(cssText);
      }

      return s;
    });
  }
  /**
   * Performs element initialization. By default this calls
   * [[`createRenderRoot`]] to create the element [[`renderRoot`]] node and
   * captures any pre-set values for registered properties.
   */


  initialize() {
    super.initialize();

    this.constructor._getUniqueStyles();

    this.renderRoot = this.createRenderRoot(); // Note, if renderRoot is not a shadowRoot, styles would/could apply to the
    // element's getRootNode(). While this could be done, we're choosing not to
    // support this now since it would require different logic around de-duping.

    if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
      this.adoptStyles();
    }
  }
  /**
   * Returns the node into which the element should render and by default
   * creates and returns an open shadowRoot. Implement to customize where the
   * element's DOM is rendered. For example, to render into the element's
   * childNodes, return `this`.
   * @returns {Element|DocumentFragment} Returns a node into which to render.
   */


  createRenderRoot() {
    return this.attachShadow({
      mode: 'open'
    });
  }
  /**
   * Applies styling to the element shadowRoot using the [[`styles`]]
   * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
   * available and will fallback otherwise. When Shadow DOM is polyfilled,
   * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
   * is available but `adoptedStyleSheets` is not, styles are appended to the
   * end of the `shadowRoot` to [mimic spec
   * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
   */


  adoptStyles() {
    const styles = this.constructor._styles;

    if (styles.length === 0) {
      return;
    } // There are three separate cases here based on Shadow DOM support.
    // (1) shadowRoot polyfilled: use ShadyCSS
    // (2) shadowRoot.adoptedStyleSheets available: use it
    // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
    // rendering


    if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
      window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map(s => s.cssText), this.localName);
    } else if (supportsAdoptingStyleSheets) {
      this.renderRoot.adoptedStyleSheets = styles.map(s => s instanceof CSSStyleSheet ? s : s.styleSheet);
    } else {
      // This must be done after rendering so the actual style insertion is done
      // in `update`.
      this._needsShimAdoptedStyleSheets = true;
    }
  }

  connectedCallback() {
    super.connectedCallback(); // Note, first update/render handles styleElement so we only call this if
    // connected after first update.

    if (this.hasUpdated && window.ShadyCSS !== undefined) {
      window.ShadyCSS.styleElement(this);
    }
  }
  /**
   * Updates the element. This method reflects property values to attributes
   * and calls `render` to render DOM via lit-html. Setting properties inside
   * this method will *not* trigger another update.
   * @param _changedProperties Map of changed properties with old values
   */


  update(changedProperties) {
    // Setting properties in `render` should not trigger an update. Since
    // updates are allowed after super.update, it's important to call `render`
    // before that.
    const templateResult = this.render();
    super.update(changedProperties); // If render is not implemented by the component, don't call lit-html render

    if (templateResult !== renderNotImplemented) {
      this.constructor.render(templateResult, this.renderRoot, {
        scopeName: this.localName,
        eventContext: this
      });
    } // When native Shadow DOM is used but adoptedStyles are not supported,
    // insert styling after rendering to ensure adoptedStyles have highest
    // priority.


    if (this._needsShimAdoptedStyleSheets) {
      this._needsShimAdoptedStyleSheets = false;

      this.constructor._styles.forEach(s => {
        const style = document.createElement('style');
        style.textContent = s.cssText;
        this.renderRoot.appendChild(style);
      });
    }
  }
  /**
   * Invoked on each update to perform rendering tasks. This method may return
   * any value renderable by lit-html's `NodePart` - typically a
   * `TemplateResult`. Setting properties inside this method will *not* trigger
   * the element to update.
   */


  render() {
    return renderNotImplemented;
  }

}
/**
 * Ensure this class is marked as `finalized` as an optimization ensuring
 * it will not needlessly try to `finalize`.
 *
 * Note this property name is a string to prevent breaking Closure JS Compiler
 * optimizations. See updating-element.ts for more information.
 */

LitElement['finalized'] = true;
/**
 * Reference to the underlying library method used to render the element's
 * DOM. By default, points to the `render` method from lit-html's shady-render
 * module.
 *
 * **Most users will never need to touch this property.**
 *
 * This  property should not be confused with the `render` instance method,
 * which should be overridden to define a template for the element.
 *
 * Advanced users creating a new base class based on LitElement can override
 * this property to point to a custom render method with a signature that
 * matches [shady-render's `render`
 * method](https://lit-html.polymer-project.org/api/modules/shady_render.html#render).
 *
 * @nocollapse
 */

LitElement.render = render$1;

var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
var twoDigitsOptional = "[1-9]\\d?";
var twoDigits = "\\d\\d";
var threeDigits = "\\d{3}";
var fourDigits = "\\d{4}";
var word = "[^\\s]+";
var literal = /\[([^]*?)\]/gm;

function shorten(arr, sLen) {
  var newArr = [];

  for (var i = 0, len = arr.length; i < len; i++) {
    newArr.push(arr[i].substr(0, sLen));
  }

  return newArr;
}

var monthUpdate = function (arrName) {
  return function (v, i18n) {
    var lowerCaseArr = i18n[arrName].map(function (v) {
      return v.toLowerCase();
    });
    var index = lowerCaseArr.indexOf(v.toLowerCase());

    if (index > -1) {
      return index;
    }

    return null;
  };
};

function assign(origObj) {
  var args = [];

  for (var _i = 1; _i < arguments.length; _i++) {
    args[_i - 1] = arguments[_i];
  }

  for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
    var obj = args_1[_a];

    for (var key in obj) {
      // @ts-ignore ex
      origObj[key] = obj[key];
    }
  }

  return origObj;
}

var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var monthNamesShort = shorten(monthNames, 3);
var dayNamesShort = shorten(dayNames, 3);
var defaultI18n = {
  dayNamesShort: dayNamesShort,
  dayNames: dayNames,
  monthNamesShort: monthNamesShort,
  monthNames: monthNames,
  amPm: ["am", "pm"],
  DoFn: function (dayOfMonth) {
    return dayOfMonth + ["th", "st", "nd", "rd"][dayOfMonth % 10 > 3 ? 0 : (dayOfMonth - dayOfMonth % 10 !== 10 ? 1 : 0) * dayOfMonth % 10];
  }
};
var globalI18n = assign({}, defaultI18n);

var setGlobalDateI18n = function (i18n) {
  return globalI18n = assign(globalI18n, i18n);
};

var regexEscape = function (str) {
  return str.replace(/[|\\{()[^$+*?.-]/g, "\\$&");
};

var pad = function (val, len) {
  if (len === void 0) {
    len = 2;
  }

  val = String(val);

  while (val.length < len) {
    val = "0" + val;
  }

  return val;
};

var formatFlags = {
  D: function (dateObj) {
    return String(dateObj.getDate());
  },
  DD: function (dateObj) {
    return pad(dateObj.getDate());
  },
  Do: function (dateObj, i18n) {
    return i18n.DoFn(dateObj.getDate());
  },
  d: function (dateObj) {
    return String(dateObj.getDay());
  },
  dd: function (dateObj) {
    return pad(dateObj.getDay());
  },
  ddd: function (dateObj, i18n) {
    return i18n.dayNamesShort[dateObj.getDay()];
  },
  dddd: function (dateObj, i18n) {
    return i18n.dayNames[dateObj.getDay()];
  },
  M: function (dateObj) {
    return String(dateObj.getMonth() + 1);
  },
  MM: function (dateObj) {
    return pad(dateObj.getMonth() + 1);
  },
  MMM: function (dateObj, i18n) {
    return i18n.monthNamesShort[dateObj.getMonth()];
  },
  MMMM: function (dateObj, i18n) {
    return i18n.monthNames[dateObj.getMonth()];
  },
  YY: function (dateObj) {
    return pad(String(dateObj.getFullYear()), 4).substr(2);
  },
  YYYY: function (dateObj) {
    return pad(dateObj.getFullYear(), 4);
  },
  h: function (dateObj) {
    return String(dateObj.getHours() % 12 || 12);
  },
  hh: function (dateObj) {
    return pad(dateObj.getHours() % 12 || 12);
  },
  H: function (dateObj) {
    return String(dateObj.getHours());
  },
  HH: function (dateObj) {
    return pad(dateObj.getHours());
  },
  m: function (dateObj) {
    return String(dateObj.getMinutes());
  },
  mm: function (dateObj) {
    return pad(dateObj.getMinutes());
  },
  s: function (dateObj) {
    return String(dateObj.getSeconds());
  },
  ss: function (dateObj) {
    return pad(dateObj.getSeconds());
  },
  S: function (dateObj) {
    return String(Math.round(dateObj.getMilliseconds() / 100));
  },
  SS: function (dateObj) {
    return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
  },
  SSS: function (dateObj) {
    return pad(dateObj.getMilliseconds(), 3);
  },
  a: function (dateObj, i18n) {
    return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
  },
  A: function (dateObj, i18n) {
    return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
  },
  ZZ: function (dateObj) {
    var offset = dateObj.getTimezoneOffset();
    return (offset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(offset) / 60) * 100 + Math.abs(offset) % 60, 4);
  },
  Z: function (dateObj) {
    var offset = dateObj.getTimezoneOffset();
    return (offset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(offset) / 60), 2) + ":" + pad(Math.abs(offset) % 60, 2);
  }
};

var monthParse = function (v) {
  return +v - 1;
};

var emptyDigits = [null, twoDigitsOptional];
var emptyWord = [null, word];
var amPm = ["isPm", word, function (v, i18n) {
  var val = v.toLowerCase();

  if (val === i18n.amPm[0]) {
    return 0;
  } else if (val === i18n.amPm[1]) {
    return 1;
  }

  return null;
}];
var timezoneOffset = ["timezoneOffset", "[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?", function (v) {
  var parts = (v + "").match(/([+-]|\d\d)/gi);

  if (parts) {
    var minutes = +parts[1] * 60 + parseInt(parts[2], 10);
    return parts[0] === "+" ? minutes : -minutes;
  }

  return 0;
}];
var parseFlags = {
  D: ["day", twoDigitsOptional],
  DD: ["day", twoDigits],
  Do: ["day", twoDigitsOptional + word, function (v) {
    return parseInt(v, 10);
  }],
  M: ["month", twoDigitsOptional, monthParse],
  MM: ["month", twoDigits, monthParse],
  YY: ["year", twoDigits, function (v) {
    var now = new Date();
    var cent = +("" + now.getFullYear()).substr(0, 2);
    return +("" + (+v > 68 ? cent - 1 : cent) + v);
  }],
  h: ["hour", twoDigitsOptional, undefined, "isPm"],
  hh: ["hour", twoDigits, undefined, "isPm"],
  H: ["hour", twoDigitsOptional],
  HH: ["hour", twoDigits],
  m: ["minute", twoDigitsOptional],
  mm: ["minute", twoDigits],
  s: ["second", twoDigitsOptional],
  ss: ["second", twoDigits],
  YYYY: ["year", fourDigits],
  S: ["millisecond", "\\d", function (v) {
    return +v * 100;
  }],
  SS: ["millisecond", twoDigits, function (v) {
    return +v * 10;
  }],
  SSS: ["millisecond", threeDigits],
  d: emptyDigits,
  dd: emptyDigits,
  ddd: emptyWord,
  dddd: emptyWord,
  MMM: ["month", word, monthUpdate("monthNamesShort")],
  MMMM: ["month", word, monthUpdate("monthNames")],
  a: amPm,
  A: amPm,
  ZZ: timezoneOffset,
  Z: timezoneOffset
}; // Some common format strings

var globalMasks = {
  default: "ddd MMM DD YYYY HH:mm:ss",
  shortDate: "M/D/YY",
  mediumDate: "MMM D, YYYY",
  longDate: "MMMM D, YYYY",
  fullDate: "dddd, MMMM D, YYYY",
  isoDate: "YYYY-MM-DD",
  isoDateTime: "YYYY-MM-DDTHH:mm:ssZ",
  shortTime: "HH:mm",
  mediumTime: "HH:mm:ss",
  longTime: "HH:mm:ss.SSS"
};

var setGlobalDateMasks = function (masks) {
  return assign(globalMasks, masks);
};
/***
 * Format a date
 * @method format
 * @param {Date|number} dateObj
 * @param {string} mask Format of the date, i.e. 'mm-dd-yy' or 'shortDate'
 * @returns {string} Formatted date string
 */


var format = function (dateObj, mask, i18n) {
  if (mask === void 0) {
    mask = globalMasks["default"];
  }

  if (i18n === void 0) {
    i18n = {};
  }

  if (typeof dateObj === "number") {
    dateObj = new Date(dateObj);
  }

  if (Object.prototype.toString.call(dateObj) !== "[object Date]" || isNaN(dateObj.getTime())) {
    throw new Error("Invalid Date pass to format");
  }

  mask = globalMasks[mask] || mask;
  var literals = []; // Make literals inactive by replacing them with @@@

  mask = mask.replace(literal, function ($0, $1) {
    literals.push($1);
    return "@@@";
  });
  var combinedI18nSettings = assign(assign({}, globalI18n), i18n); // Apply formatting rules

  mask = mask.replace(token, function ($0) {
    return formatFlags[$0](dateObj, combinedI18nSettings);
  }); // Inline literal values back into the formatted value

  return mask.replace(/@@@/g, function () {
    return literals.shift();
  });
};
/**
 * Parse a date string into a Javascript Date object /
 * @method parse
 * @param {string} dateStr Date string
 * @param {string} format Date parse format
 * @param {i18n} I18nSettingsOptional Full or subset of I18N settings
 * @returns {Date|null} Returns Date object. Returns null what date string is invalid or doesn't match format
 */


function parse(dateStr, format, i18n) {
  if (i18n === void 0) {
    i18n = {};
  }

  if (typeof format !== "string") {
    throw new Error("Invalid format in fecha parse");
  } // Check to see if the format is actually a mask


  format = globalMasks[format] || format; // Avoid regular expression denial of service, fail early for really long strings
  // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS

  if (dateStr.length > 1000) {
    return null;
  } // Default to the beginning of the year.


  var today = new Date();
  var dateInfo = {
    year: today.getFullYear(),
    month: 0,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    isPm: null,
    timezoneOffset: null
  };
  var parseInfo = [];
  var literals = []; // Replace all the literals with @@@. Hopefully a string that won't exist in the format

  var newFormat = format.replace(literal, function ($0, $1) {
    literals.push(regexEscape($1));
    return "@@@";
  });
  var specifiedFields = {};
  var requiredFields = {}; // Change every token that we find into the correct regex

  newFormat = regexEscape(newFormat).replace(token, function ($0) {
    var info = parseFlags[$0];
    var field = info[0],
        regex = info[1],
        requiredField = info[3]; // Check if the person has specified the same field twice. This will lead to confusing results.

    if (specifiedFields[field]) {
      throw new Error("Invalid format. " + field + " specified twice in format");
    }

    specifiedFields[field] = true; // Check if there are any required fields. For instance, 12 hour time requires AM/PM specified

    if (requiredField) {
      requiredFields[requiredField] = true;
    }

    parseInfo.push(info);
    return "(" + regex + ")";
  }); // Check all the required fields are present

  Object.keys(requiredFields).forEach(function (field) {
    if (!specifiedFields[field]) {
      throw new Error("Invalid format. " + field + " is required in specified format");
    }
  }); // Add back all the literals after

  newFormat = newFormat.replace(/@@@/g, function () {
    return literals.shift();
  }); // Check if the date string matches the format. If it doesn't return null

  var matches = dateStr.match(new RegExp(newFormat, "i"));

  if (!matches) {
    return null;
  }

  var combinedI18nSettings = assign(assign({}, globalI18n), i18n); // For each match, call the parser function for that date part

  for (var i = 1; i < matches.length; i++) {
    var _a = parseInfo[i - 1],
        field = _a[0],
        parser = _a[2];
    var value = parser ? parser(matches[i], combinedI18nSettings) : +matches[i]; // If the parser can't make sense of the value, return null

    if (value == null) {
      return null;
    }

    dateInfo[field] = value;
  }

  if (dateInfo.isPm === 1 && dateInfo.hour != null && +dateInfo.hour !== 12) {
    dateInfo.hour = +dateInfo.hour + 12;
  } else if (dateInfo.isPm === 0 && +dateInfo.hour === 12) {
    dateInfo.hour = 0;
  }

  var dateWithoutTZ = new Date(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute, dateInfo.second, dateInfo.millisecond);
  var validateFields = [["month", "getMonth"], ["day", "getDate"], ["hour", "getHours"], ["minute", "getMinutes"], ["second", "getSeconds"]];

  for (var i = 0, len = validateFields.length; i < len; i++) {
    // Check to make sure the date field is within the allowed range. Javascript dates allows values
    // outside the allowed range. If the values don't match the value was invalid
    if (specifiedFields[validateFields[i][0]] && dateInfo[validateFields[i][0]] !== dateWithoutTZ[validateFields[i][1]]()) {
      return null;
    }
  }

  if (dateInfo.timezoneOffset == null) {
    return dateWithoutTZ;
  }

  return new Date(Date.UTC(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute - dateInfo.timezoneOffset, dateInfo.second, dateInfo.millisecond));
}

var fecha = {
  format: format,
  parse: parse,
  defaultI18n: defaultI18n,
  setGlobalDateI18n: setGlobalDateI18n,
  setGlobalDateMasks: setGlobalDateMasks
};

var a = function () {
  try {
    new Date().toLocaleDateString("i");
  } catch (e) {
    return "RangeError" === e.name;
  }

  return !1;
}() ? function (e, t) {
  return e.toLocaleDateString(t, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
} : function (t) {
  return fecha.format(t, "mediumDate");
},
    r = function () {
  try {
    new Date().toLocaleString("i");
  } catch (e) {
    return "RangeError" === e.name;
  }

  return !1;
}() ? function (e, t) {
  return e.toLocaleString(t, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
} : function (t) {
  return fecha.format(t, "haDateTime");
},
    n = function () {
  try {
    new Date().toLocaleTimeString("i");
  } catch (e) {
    return "RangeError" === e.name;
  }

  return !1;
}() ? function (e, t) {
  return e.toLocaleTimeString(t, {
    hour: "numeric",
    minute: "2-digit"
  });
} : function (t) {
  return fecha.format(t, "shortTime");
};

function d(e) {
  return e.substr(0, e.indexOf("."));
}

const back_btn = html `
  <svg class="panel-btn" tabindex="2" id="back-button" viewBox="0 0 28 28">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0 14C0 21.732 6.26801 28 14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14ZM26.7272 14C26.7272 21.0291 21.029 26.7273 14 26.7273C6.97089 26.7273 1.27269 21.0291 1.27269 14C1.27269 6.97091 6.97089 1.27272 14 1.27272C21.029 1.27272 26.7272 6.97091 26.7272 14Z"
      fill="#007AFF"
    ></path>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14 0C6.26734 0 0 6.26734 0 14C0 21.7315 6.26734 28 14 28C21.7315 28 28 21.7315 28 14C28 6.26734 21.7315 0 14 0Z"
    ></path>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M11.9318 14.1273C11.806 13.9964 11.8079 13.7891 11.9362 13.6606L17.0778 8.50739C17.4034 8.18102 17.4023 7.653 17.0753 7.32802L16.9897 7.24301C16.6627 6.91802 16.1337 6.91914 15.808 7.24551L9.43074 13.6372C9.30248 13.7657 9.30054 13.973 9.42636 14.1039L15.8075 20.7433C16.1269 21.0757 16.6559 21.0867 16.989 20.7679L17.0761 20.6845C17.4091 20.3657 17.4201 19.8378 17.1007 19.5054L11.9318 14.1273Z"
      fill="white"
    ></path>
  </svg>
`;
const confirm_btn = html `
  <svg class="panel-btn" tabindex="2" id="confirm-button" viewBox="0 0 28 28">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14 0C6.26734 0 0 6.26734 0 14C0 21.7315 6.26734 28 14 28C21.7315 28 28 21.7315 28 14C28 6.26734 21.7315 0 14 0Z"
    ></path>
    <path
      d="M12.2465 18.0302L19.8067 8.95796C20.0929 8.61449 20.6033 8.56809 20.9468 8.85431C21.2902 9.14052 21.3367 9.65098 21.0504 9.99444L12.9552 19.7087C12.6625 20.0599 12.1372 20.0992 11.7955 19.7955L6.93839 15.4781C6.60423 15.181 6.57413 14.6693 6.87116 14.3352C7.16819 14.001 7.67986 13.9709 8.01402 14.268L12.2465 18.0302Z"
      fill="white"
    ></path>
  </svg>
`;
const heat_request = html `
  <svg class="heatreq_svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24">
    <path
      d="M1.87697 2.77194C1.39922 2.16421 1.50209 1.28228 2.10674 0.802095C2.71138 0.321909 3.58884 0.425306 4.06658 1.03304C6.82192 4.53804 6.82192 8.44325 4.12153 12.3907C2.12537 15.3087 2.36258 18.1189 4.92785 21.197C5.42268 21.7907 5.34493 22.6753 4.75418 23.1726C4.16344 23.67 3.2834 23.5918 2.78857 22.9981C-0.555716 18.9852 -0.909462 14.7944 1.82202 10.8015C3.84928 7.83808 3.84928 5.28087 1.87697 2.77194Z"
    ></path>
    <path
      d="M10.8069 2.77194C10.3292 2.16421 10.432 1.28228 11.0367 0.802095C11.6413 0.321909 12.5188 0.425306 12.9965 1.03304C15.7519 4.53804 15.7519 8.44325 13.0515 12.3907C11.0553 15.3087 11.2925 18.1189 13.8578 21.197C14.3526 21.7907 14.2749 22.6753 13.6841 23.1726C13.0934 23.67 12.2133 23.5918 11.7185 22.9981C8.37422 18.9852 8.02047 14.7944 10.752 10.8015C12.7792 7.83808 12.7792 5.28087 10.8069 2.77194Z"
    ></path>
    <path
      d="M19.7371 2.77194C19.2593 2.16421 19.3622 1.28228 19.9668 0.802095C20.5715 0.321909 21.4489 0.425306 21.9267 1.03304C24.682 4.53804 24.682 8.44325 21.9816 12.3907C19.9855 15.3087 20.2227 18.1189 22.788 21.197C23.2828 21.7907 23.205 22.6753 22.6143 23.1726C22.0235 23.67 21.1435 23.5918 20.6487 22.9981C17.3044 18.9852 16.9506 14.7944 19.6821 10.8015C21.7094 7.83808 21.7094 5.28087 19.7371 2.77194Z"
    ></path>
  </svg>
`;

const air_comfort = html `
  <svg xmlns="http://www.w3.org/2000/svg" class="panel-btn" id="air-comfort" viewBox="0 0 79 63">
    <path
      fill-rule="evenodd"
      d="M37.441 21.802h-.001l-34.984-.003A2.458 2.458 0 0 1 0 19.343a2.46 2.46 0 0 1 2.456-2.457l34.984.003h.001a5.944 5.944 0 0 0 4.231-1.755 5.946 5.946 0 0 0 1.757-4.232c0-1.597-.623-3.1-1.756-4.233a5.948 5.948 0 0 0-4.232-1.756 5.995 5.995 0 0 0-5.988 5.988c0 .656-.256 1.273-.72 1.736-.464.464-1.08.72-1.736.72h-.002a2.459 2.459 0 0 1-2.455-2.456C26.541 4.89 31.431 0 37.441 0a10.832 10.832 0 0 1 7.705 3.197 10.823 10.823 0 0 1 3.195 7.705c0 6.01-4.89 10.9-10.9 10.9m26.54 12.065h-.002l-55.493-.003a2.46 2.46 0 0 1-2.456-2.458 2.46 2.46 0 0 1 2.457-2.456l55.492.005c5.297 0 9.608-4.309 9.608-9.606 0-2.561-1-4.973-2.817-6.79a9.541 9.541 0 0 0-6.789-2.818h-.001a9.54 9.54 0 0 0-6.789 2.817 9.541 9.541 0 0 0-2.818 6.789 2.46 2.46 0 0 1-2.457 2.456 2.46 2.46 0 0 1-2.456-2.456c.001-8.006 6.514-14.519 14.52-14.519h.001c8.006.001 14.519 6.515 14.519 14.521a14.424 14.424 0 0 1-4.259 10.262 14.418 14.418 0 0 1-10.26 4.256M51.913 62.82c-6.011-.001-10.901-4.892-10.9-10.903a2.46 2.46 0 0 1 2.456-2.456 2.458 2.458 0 0 1 2.456 2.456 5.995 5.995 0 0 0 5.988 5.989 5.994 5.994 0 0 0 5.988-5.987 5.995 5.995 0 0 0-5.987-5.989l-37.397-.003a2.46 2.46 0 0 1-2.456-2.456c0-.657.256-1.274.721-1.738a2.438 2.438 0 0 1 1.734-.718h.004l37.394.003c2.908 0 5.644 1.135 7.705 3.196a10.83 10.83 0 0 1 3.196 7.705c-.001 6.011-4.892 10.901-10.902 10.901"
    />
  </svg>
`;

function _render_graphpos(x, y, circle_size) {
    const half = circle_size / 2;
    return html `
    <svg
      width="${circle_size}"
      height="${circle_size}"
      xmlns="http://www.w3.org/2000/svg"
      class="bubble__graph-current_position"
      style="top: ${x}px; left: ${y}px;"
    >
      <circle cx="${half}" cy="${half}" r="${half}" fill="white"></circle>
    </svg>
  `;
}
const airqual_warning = html `
  <svg appSvgSymbol="warning" class="value-with-alert__alert">
    <path
      d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12zM6 1.5a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
    />
  </svg>
`;
const bubble_humid_warn = svg `
<path style="transform: scale(1.633);" fill="#3849AC" fill-rule="nonzero" d="M125.892 24.108c-4.621-4.357-11.9-4.143-16.257.478-4.357 4.62-4.143 11.899.478 16.256 9.766 9.209 15.392 21.97 15.392 35.658 0 13.69-5.627 26.451-15.394 35.66-4.621 4.357-4.835 11.635-.478 16.256s11.635 4.836 16.256.479c14.33-13.511 22.616-32.305 22.616-52.395 0-20.089-8.285-38.881-22.613-52.392z"></path>
`;
function _isAirQualityBackButton(target) {
    /**
     * Temperature Override Cancel button check
     */
    const cancelOverrideClass = 'btn__overview';
    const exists = target.classList.contains(cancelOverrideClass);
    return exists;
}
function _airquality_mouseclick(e = null, shadowRoot) {
    const thermostat = shadowRoot;
    if (e !== null && _isAirQualityBackButton(e.target)) {
        thermostat.getElementById('popup').classList.remove('airquality');
    }
}
function _air_comfort(shadowRoot, temperature, humidity) {
    const point_size = 15;
    const lower_temp = 5;
    const upper_temp = 45;
    const temp_range = upper_temp - lower_temp;
    const new_temp = temperature - lower_temp;
    const svg_size = 250;
    const svg_outer_stroke = 2;
    const points = svg_size / 100;
    let x = 0, y = 0;
    if (temperature > upper_temp) {
        x = 0;
    }
    else {
        if (temperature < lower_temp) {
            x = 100 * points;
        }
        else {
            x = (new_temp / temp_range) * 100 * points - point_size / 2;
            x = svg_size - x;
        }
    }
    y = (svg_size / 100) * humidity - point_size / 2;
    const humwarn = humidity > 60;
    const bubble_humwarn = humidity > 70;
    const tempwarn = temperature < 20;
    let thermal_comfort = '';
    if (humwarn) {
        thermal_comfort = ' humid';
    }
    if (tempwarn) {
        thermal_comfort = thermal_comfort + ' cold';
    }
    if (thermal_comfort == '') {
        thermal_comfort = 'pleasant';
    }
    return html `
    <div class="airqual ${thermal_comfort}">
      <header class="airqual__header">
        <h2 class="airqual-header__room-name">
          <span style="display:none">Master Bedroom</span>
        </h2>
        <div class="thermal-comfort">
          <h3 class="thermal-comfort_status">
            <span>${thermal_comfort}</span>
          </h3>
        </div>
      </header>
      <main class="bubble">
        <span class="bubble__label-top">Too warm</span>
        <span class="bubble__label-bottom">Cold</span>
        <span class="bubble__label-left">Dry</span>
        <span class="bubble__label-right">Humid</span>
        <div class="bubble__graph">
          ${_render_graphpos(x, y, point_size)}
          <svg width="${svg_size}" height="${svg_size}" xmlns="http://www.w3.org/2000/svg">
            ${bubble_humwarn
        ? html `
                  ${bubble_humid_warn}
                `
        : ``}
            <circle
              cx="${svg_size / 2}"
              cy="${svg_size / 2}"
              r="${svg_size / 2 - svg_outer_stroke}"
              stroke="white"
              stroke-width="${svg_outer_stroke}"
              fill="none"
            ></circle>
            <circle
              cx="${svg_size / 2}"
              cy="${svg_size / 2}"
              r="${(svg_size / 2 / 100) * 40}"
              fill="white"
              opacity=".6"
            ></circle>
          </svg>
        </div>
        <div class="bubble__alert">
          ${bubble_humwarn
        ? html `
                <p class="alert alert--humid">Increased risk of mold</p>
              `
        : ``}
        </div>
      </main>
      <footer class="airqual__footer">
        <div>
          <h4 class="measurement__label">Temperature</h4>
          <div class="measurement__content">
            <div class="value-with-alert">
              ${tempwarn
        ? html `
                    ${airqual_warning}
                  `
        : ``}
              <div class="app-temperature-display value-with-alert__value">
                <div>
                  <div class="temperature">${temperature}°</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 class="measurement__label">Humidity</h4>
          <div class="measurement__content">
            <div class="value-with-alert">
              ${humwarn
        ? html `
                    ${airqual_warning}
                  `
        : ``}
              <app-humidity class="value-with-alert__value">
                <div class="humidity">
                  ${humidity}%
                </div>
              </app-humidity>
            </div>
          </div>
        </div>
      </footer>
      <app-air-comfort-message class="airqual__message">
        <aside class="message">
          <figure style="display:none;" class="stacked">
            <figcaption class="message__text text-center" style="width: 100%;">
              <p>
                Feel like getting under a warm blanket? Turn up your heating a bit to stay comfy in here.
              </p>
            </figcaption>
          </figure>
          <footer class="message__link text-center stacked">
            <a
              class="btn btn--more text-center btn__overview"
              @click="${(e) => _airquality_mouseclick(e, shadowRoot)}"
            >
              <span style="pointer-events:none;">Back</span>
            </a>
          </footer>
        </aside>
      </app-air-comfort-message>
    </div>
  `;
}

const CARD_VERSION = '0.0.1';
const CARD_NAME = 'tadothermostatpopup-card';
const CARD_FRIENDLY_NAME = 'Tado Thermostat Popup';
const CARD_DESC = 'A popup card to replace tado climate entities more-info page.';

function infotoconsole() {
    console.info(`%c  ${CARD_NAME.toUpperCase()}  \n%c  Version ${CARD_VERSION}    `, 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');
}
function cctoconsole() {
    window.customCards = window.customCards || [];
    window.customCards.push({
        type: CARD_NAME,
        name: CARD_FRIENDLY_NAME,
        description: CARD_DESC,
    });
}

var style = ({ css }) => {
        const extractorBody = `return css\`:host *:focus{outline:-webkit-focus-ring-color auto 0px}:host *{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;-ms-box-sizing:border-box;-o-box-sizing:border-box;box-sizing:border-box}.popup-inner{max-height:600px;min-height:600px;max-width:400px;width:100%;display:flex;overflow:hidden;color:white}.popup-inner.temp-5{background:linear-gradient(#3c9672, #3c868b)}.popup-inner.temp-6{background:linear-gradient(#3c9973, #398b8e)}.popup-inner.temp-7{background:linear-gradient(#3c9e74, #36908f)}.popup-inner.temp-8{background:linear-gradient(#3da275, #33938e)}.popup-inner.temp-9{background:linear-gradient(#3da675, #30958c)}.popup-inner.temp-10{background:linear-gradient(#3daa76, #2d988a)}.popup-inner.temp-11{background:linear-gradient(#3eae76, #2a9a87)}.popup-inner.temp-12{background:linear-gradient(#3eb277, #289d84)}.popup-inner.temp-13{background:linear-gradient(#3eb677, #259f81)}.popup-inner.temp-14{background:linear-gradient(#3ebb77, #22a27d)}.popup-inner.temp-15{background:linear-gradient(#3ebf77, #1fa478)}.popup-inner.temp-16{background:linear-gradient(#3fc277, #1ca674)}.popup-inner.temp-17{background:linear-gradient(#42c478, #1aa96e)}.popup-inner.temp-18{background:linear-gradient(#44c678, #17ab69)}.popup-inner.temp-19{background:linear-gradient(#ffd000, #fb0)}.popup-inner.temp-20{background:linear-gradient(#ffc500, #fa0)}.popup-inner.temp-21{background:linear-gradient(#ffba00, #f90)}.popup-inner.temp-22{background:linear-gradient(#ffae00, #f80)}.popup-inner.temp-23{background:linear-gradient(#ffa300, #f70)}.popup-inner.temp-24{background:linear-gradient(#ff9800, #f60)}.popup-inner.temp-25{background:linear-gradient(#ff8c00, #f50)}.popup-inner.temp-off{background:linear-gradient(#9fb3c2, #688396)}.panel-btn{width:2em;height:2em;border-radius:2em;fill:rgba(255,255,255,0.2)}.btn__holder.options{flex:0 0 100px;transition-property:flex;transition-delay:0s;transition-duration:.5s;transition-timing-function:ease-in-out;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;overflow:hidden;align-items:flex-start;justify-content:flex-end;flex-direction:row}:host([temp_selection]) .btn__holder.options{flex:0 0 0px;transition-property:flex;transition-delay:0s;transition-duration:.5s;transition-timing-function:ease-in-out}.btn__holder.selection{flex:0 0 0px;transition-property:flex;transition-delay:0s;transition-duration:.5s;transition-timing-function:ease-in-out;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;overflow:hidden}:host([temp_selection]) .btn__holder.selection{flex:0 0 75px;transition-property:flex;transition-delay:0s;transition-duration:.5s;transition-timing-function:ease-in-out;flex-direction:row;justify-content:space-between}.btn__airqual{visibility:visible;opacity:1;transition-property:visibility, opacity;transition-delay:0s,.5s;transition-duration:0s,.5s;transition-timing-function:ease-in-out;margin:20px;width:28px;height:28px;pointer-events:all}.btn__airqual svg{pointer-events:none;fill:#359296}:host([temp_selection]) .btn__airqual{transition-property:visibility, opacity;transition-delay:.5s,0s;visibility:hidden;opacity:0;transition-timing-function:ease-in-out;pointer-events:none}.btn__cancel{padding:0 1.5em;border-radius:1.25em;line-height:2.5;color:#213953;border:1px solid #213953;text-align:center;background-color:#fff;width:40%;margin:0px auto}.btn__back{pointer-events:none;transition-property:visibility, opacity;transition-delay:.5s,0s;visibility:hidden;opacity:0;transition-timing-function:ease-in-out}.btn__back svg{pointer-events:none}:host([temp_selection]) .btn__back{pointer-events:all;margin:20px;width:28px;height:28px;visibility:visible;opacity:1;transition-property:visibility, opacity;transition-delay:0s,.5s;transition-duration:0s,.5s;transition-timing-function:ease-in-out}.btn__confirm{pointer-events:none;transition-property:visibility, opacity;transition-delay:.5s,0s;visibility:hidden;opacity:0;transition-timing-function:ease-in-out}.btn__confirm svg{pointer-events:none}:host([temp_selection]) .btn__confirm{pointer-events:all;margin:20px;width:28px;height:28px;visibility:visible;opacity:1;transition-property:visibility, opacity;transition-delay:0s,.5s;transition-duration:0s,.5s;transition-timing-function:ease-in-out}input[type='range']{background-color:transparent;-webkit-appearance:none;transform:rotate(-90deg);-ms-writing-mode:bt-lr;writing-mode:bt-lr;position:absolute;top:0px}input[type='range']::-webkit-slider-thumb{-webkit-appearance:none;border:1px solid #000000;height:36px;width:16px;border-radius:3px;background:#ffffff;cursor:pointer;margin-top:-14px;box-shadow:1px 1px 1px #000000, 0px 0px 1px #0d0d0d;visibility:hidden}input[type='range']::-moz-range-thumb{box-shadow:1px 1px 1px #000000, 0px 0px 1px #0d0d0d;border:1px solid #000000;height:36px;width:16px;border-radius:3px;background:#ffffff;cursor:pointer;visibility:hidden}input[type='range']::-ms-thumb{box-shadow:1px 1px 1px #000000, 0px 0px 1px #0d0d0d;border:1px solid #000000;height:36px;height:36px;width:16px;border-radius:3px;background:#ffffff;cursor:pointer;visibility:hidden}.track{transition-property:visibility, opacity;transition-delay:.5s,0s;visibility:hidden;opacity:0;transition-timing-function:ease-in-out;position:absolute;left:0;right:0;bottom:0;background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="450" height="472" viewBox="0 0 450 472" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M199 22L0 22L3.93402e-05 472L450 472L450 22H251C251 36.3594 239.359 48 225 48C210.641 48 199 36.3594 199 22Z"    fill="white"  /><path fill-rule="evenodd" clip-rule="evenodd" d="M203 22C203 9.84974 212.85 0 225 0C237.15 0 247 9.84974 247 22C247 34.1503 237.15 44 225 44C212.85 44 203 34.1503 203 22ZM220 12L218.5 10.5L225 4L231.5 10.5L230 12L225 7L220 12ZM231.5 33.5L230 32L225 37L220 32L218.5 33.5L225 40L231.5 33.5Z"    fill="white"  /></svg>');background-position:center 0;background-repeat:no-repeat;background-clip:padding-box;padding:22px 0 0;box-sizing:content-box}:host([temp_selection]) .track{visibility:visible;opacity:1;transition-property:visibility, opacity;transition-delay:0s,.5s;transition-duration:0s,.5s;transition-timing-function:ease-in-out}.thermostat{margin:auto}.thermostat:hover{transform:scale(1.03)}.thermostat.mousedown{transform:scale(0.95)}:host([temp_selection]) .thermostat{flex:0 0 444px;margin:31px auto 50px auto}.tado{position:relative}.tado-air{position:absolute;left:400px;transition-property:left;transition-delay:0s;transition-duration:0.5s;transition-timing-function:ease-in-out;width:400px;height:600px}.airquality .tado-air{position:absolute;left:0px;transition-property:left;transition-delay:0s;transition-duration:0.5s;transition-timing-function:ease-in-out}.tado-card{position:absolute;left:0px;transition-property:left;transition-delay:0s;transition-duration:0.5s;transition-timing-function:ease-in-out}.airquality .tado-card{position:absolute;left:-400px;transition-property:left;transition-delay:0s;transition-duration:0.5s;transition-timing-function:ease-in-out}.tado-card-top{flex:0 0 100px;transition-property:flex;transition-delay:0s;transition-duration:.5s;transition-timing-function:ease-in-out;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;overflow:hidden}:host([temp_selection]) .tado-card-top{flex:0 0 75px;transition-property:flex;transition-delay:0s;transition-duration:.5s;transition-timing-function:ease-in-out}.tado-card-middle{flex:0 0 300px;transition-property:flex;transition-delay:0s;transition-duration:.5s;transition-timing-function:ease-in-out;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;overflow:hidden;box-shadow:rgba(100,100,100,0.2) 0px 0px 30px;background-color:rgba(255,255,255,0.1);position:relative;max-width:300px;border-radius:75px}:host([temp_selection]) .tado-card-middle{flex:0 0 444px;transition-property:flex;transition-delay:0s;transition-duration:.5s;transition-timing-function:ease-in-out}.tado-card-bottom{flex:0 0 200px;transition-property:flex;transition-delay:0s;transition-duration:.5s;transition-timing-function:ease-in-out;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;overflow:hidden;flex-direction:row}:host([temp_selection]) .tado-card-bottom{flex:0 0 0px;transition-property:flex;transition-delay:0s;transition-duration:.5s;transition-timing-function:ease-in-out}.thermostat_part_top{line-height:75px;flex:0 0 75px;text-align:center;width:100%;transition-property:flex, opacity;transition-delay:0s;transition-duration:1s;transition-timing-function:ease-in-out;overflow:hidden}:host([temp_selection]) .thermostat_part_top{opacity:0;flex:0 0 0px}:host([temp_overlay]) .thermostat_part_top{flex:0 0 50px}.thermostat_part_middle{flex:0 0 150px;width:100%;height:100%;overflow:hidden;display:flex;font-size:6rem;text-align:center;justify-content:center;flex-flow:column}:host([temp_selection]) .thermostat_part_middle{width:300px;flex:0 0 400px}:host([temp_overlay]) .thermostat_part_middle{flex:0 0 100px;font-size:5.5em}.thermostat_part_bottom{visibility:visible;opacity:1;transition-property:visibility, opacity;transition-delay:0s,.5s;transition-duration:0s,.5s;transition-timing-function:ease-in-out;flex:0 0 75px;width:100%;overflow:hidden;position:relative}:host([temp_selection]) .thermostat_part_bottom{transition-property:visibility, opacity;transition-delay:.5s,0s;visibility:hidden;opacity:0;transition-timing-function:ease-in-out;flex:0 0 0px}:host([temp_overlay]) .thermostat_part_bottom{flex:0 0 150px;display:flex;flex-direction:column;overflow:hidden}.text{pointer-events:none}.text_maintemp{visibility:visible;opacity:1;transition-property:visibility, opacity;transition-delay:0s,.5s;transition-duration:0s,.5s;transition-timing-function:ease-in-out}:host([temp_selection]) .text_maintemp{transition-property:visibility, opacity;transition-delay:.5s,0s;visibility:hidden;opacity:0;transition-timing-function:ease-in-out}.text_temperature{transition-property:visibility, opacity;transition-delay:.5s,0s;visibility:hidden;opacity:0;transition-timing-function:ease-in-out;font-size:48px;align-self:center;text-align:center;text-transform:uppercase;font-weight:700}:host([temp_selection]) .text_temperature{visibility:visible;opacity:1;transition-property:visibility, opacity;transition-delay:0s,.5s;transition-duration:0s,.5s;transition-timing-function:ease-in-out}.heatreq{pointer-events:none;flex:0 0 100px;width:24px;margin:0px auto;transition-property:flex, margin;transition-delay:0s;transition-duration:1s;transition-timing-function:ease-in-out}.heatreq svg path{opacity:0.38;fill:#fff}:host([temp_heating~='heating_one']) .heatreq svg path:nth-child(1){opacity:1}:host([temp_heating~='heating_two']) .heatreq svg path:nth-child(1),:host([temp_heating~='heating_two']) .heatreq svg path:nth-child(2){opacity:1}:host([temp_heating~='heating_three']) .heatreq svg path:nth-child(1),:host([temp_heating~='heating_three']) .heatreq svg path:nth-child(2),:host([temp_heating~='heating_three']) .heatreq svg path:nth-child(3){opacity:1}:host([temp_overlay]) .heatreq{flex:0 0 50px;overflow:hidden;margin:0 auto}.overlay{flex:0 0 0px;background-color:#fff;color:#213953;opacity:0;transition-property:bottom, opacity;transition-delay:0s, 0s;transition-duration:1s, 1s;transition-timing-function:ease-in-out;display:flex;flex-direction:column;overflow:hidden;position:relative;width:100%;padding:0 0 26px 0;bottom:-100px}:host([temp_overlay]) .overlay{flex:0 0 100px;opacity:1;transition-duration:1s, 1s;bottom:0px}.overlay_text{text-align:center;padding:10px;width:calc(100% - 20px)}.info{display:flex;align-items:center;max-height:200px;opacity:1;transition-property:max-height, opacity;transition-delay:0s, 0s;transition-duration:1s, 1s;transition-timing-function:ease-in-out}.info_sensor{display:flex;align-items:center;flex-direction:column;width:100px}.info_sensor_label{font-size:1rem;line-height:3rem;font-weight:300}.info_sensor_value{font-size:1.8rem;line-height:1.8rem;font-weight:700}:host([temp_selection]) .info{max-height:0;opacity:0;transition-delay:0s, 0s;overflow:hidden}.tado-air .airqual.humid{background:linear-gradient(110deg, #6ba0e1, #5463c4)}.tado-air .airqual.cold{background:linear-gradient(110deg, #6bb0b3, #4d9699)}.tado-air .airqual.pleasant{background:linear-gradient(110deg, #3bce91, #19b876)}.tado-air .airqual{height:100%;width:100%;background:linear-gradient(110deg, #6bb0b3, #4d9699);font-size:0.8em;color:#fff;display:flex;flex-flow:column nowrap;justify-content:space-between;align-items:center;overflow:hidden}.tado-air .airqual__header{width:100%;flex:0 0 auto;padding:16px;display:flex;flex-flow:row nowrap;justify-content:space-between;align-items:flex-start}.tado-air .airqual-header__room-name{min-width:30%;margin-top:0;margin-right:15px;font-size:1.8em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tado-air .airqual__footer{width:100%;flex:0 0 51px;padding-bottom:16px;display:flex;flex-flow:row nowrap;justify-content:space-around;align-items:flex-end}.tado-air .airqual .thermal-comfort{max-width:70%}.tado-air .airqual .thermal-comfort_status{margin:0;font-size:1.8em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right}.tado-air .measurement__label{margin-bottom:3px;text-transform:uppercase;font-weight:400}.tado-air .measurement__content,.tado-air .value-with-alert{display:flex;justify-content:center}.tado-air .value-with-alert{align-items:center;position:relative}.tado-air .value-with-alert__alert{width:12px;height:12px;position:absolute;right:100%;bottom:5px;margin-right:4px;fill:#fff;opacity:0.7}.tado-air .value-with-alert__value{font-size:1.5em}.tado-air .temperature{font-weight:400}.tado-air .humidity{font-weight:400}.tado-air .app-air-comfort-message{display:block;width:100%;background-color:#fff}.tado-air .message{color:#485258;font-size:14px}.tado-air .message figure{display:flex}.tado-air .stacked{margin:16px 0;padding:0 16px}.tado-air .text-center{text-align:center}.tado-air .bubble{flex:0 0 246px;padding-top:10px;position:relative;display:grid;grid-template-columns:1fr 250px 1fr;grid-auto-rows:-webkit-min-content;grid-auto-rows:min-content;text-align:center;align-items:center;grid-column-gap:5px;grid-row-gap:5px;text-transform:uppercase}.tado-air .bubble__label-top{grid-row-start:1;grid-column-start:2}.tado-air .bubble__label-bottom{grid-row-start:3;grid-column-start:2}.tado-air .bubble__label-left{grid-row-start:2;grid-column-start:1;text-align:right}.tado-air .bubble__label-right{grid-row-start:2;grid-column-start:3}.tado-air .bubble__graph{grid-row-start:2;grid-column-start:2;position:relative;overflow:hidden}.tado-air .bubble__graph-current_position{position:absolute}.tado-air .bubble__alert{position:absolute;bottom:-40px;width:100%}.tado-air .alert{display:inline-block;margin:auto;padding:0 8px;line-height:1.5em;font-size:1em;font-weight:400;text-transform:none}.tado-air .alert--humid{background:#3849ac}.tado-air .btn{cursor:pointer;display:inline-block;color:#000000;font-size:0.9em;text-decoration:none;text-align:left;line-height:2.5;padding:0 1.5em;border-radius:1.25em;border:none;transition:background-color 0.1s ease, box-shadow 0.15s ease}.tado-air .btn--more{background-color:#ffffff;min-width:137px;height:34px;line-height:34px;border-radius:17px;text-align:center}
\`;`;
        return (new Function("css", extractorBody))(css);
    };

infotoconsole();
cctoconsole();
let TadoPopupCard = class TadoPopupCard extends LitElement {
    constructor() {
        super();
        this.temp_wanted = 0;
        this.temp_class = 'temp-off';
        this.temp_selection = false;
        this.temp_heating = 'heating_off';
        this.temp_airqual = false;
        this.temp_overlay = false;
    }
    get entity() {
        return this.hass.states[this.config.entity];
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    static get properties() {
        return {
            active: {},
            temp_selection: { type: Boolean, reflect: true },
            temp_overlay: { type: Boolean, reflect: true },
            temp_heating: { type: String, reflect: true },
            temp_airqual: { type: Boolean, reflect: true },
            temp_class: { type: String },
            temp_wanted: { type: Number },
        };
    }
    render() {
        var _a;
        if (!this.entity) {
            throw new Error('Entity not found');
        }
        if (d(this.entity.entity_id) !== 'climate') {
            throw new Error('You must set a climate entity');
        }
        const stateObj = (_a = this.entity) === null || _a === void 0 ? void 0 : _a.state;
        const { hvac_modes, min_temp, max_temp, __target_temp_step, __preset_modes, current_temperature, temperature, current_humidity, hvac_action, __preset_mode, __friendly_name, __supported_features, } = this.entity.attributes;
        let thermostat__body;
        let thermostat__target;
        let thermostat__header;
        if (hvac_action == 'off') {
            thermostat__header = 'Frost Protection';
            thermostat__target = 0;
            thermostat__body = 'OFF';
        }
        else if (hvac_action == 'heating') {
            thermostat__header = 'Heating to';
            thermostat__body = temperature.toString() + '°';
            thermostat__target = temperature;
        }
        else if (hvac_action == 'idle') {
            thermostat__header = 'Set to';
            thermostat__body = temperature.toString() + '°';
            thermostat__target = temperature;
        }
        else {
            thermostat__header = 'No remote access';
            thermostat__body = 'replace with svg';
            thermostat__target = 0;
        }
        if (hvac_modes.indexOf(stateObj) > -1) {
            if (hvac_action == 'off') {
                this.temp_class = 'temp-off';
            }
            else {
                this.temp_class = 'temp-' + parseInt(temperature).toString();
            }
        }
        else {
            this.temp_class = 'disconnected';
        }
        const track_height = ((100 / 21) * (thermostat__target - 4)).toString() + '%';
        return html `
      <div class="popup-wrapper">
        <div style="display:flex;width:100%;height:100%;">
          <div id="popup" class="popup-inner ${this.temp_class}">
            <div class="tado">
              <div class="tado-air">
                ${_air_comfort(this.shadowRoot, current_temperature, current_humidity)}
              </div>
              <div class="tado-card" style="display: flex;flex-direction: column;width: 400px;height: 600px">
                <div class="tado-card-top">
                  <div class="btn__holder options">
                    <div
                      class="btn__airqual"
                      @click="${(e) => this._thermostat_mouseclick(e)}"
                    >
                      ${air_comfort}
                    </div>
                  </div>
                  <div class="btn__holder selection">
                    <div
                      class="btn__back"
                      @click="${(e) => this._thermostat_mouseclick(e)}"
                    >
                      ${back_btn}
                    </div>
                    <div id="target_temp_track" class="text_temperature">${thermostat__body}</div>
                    <div
                      class="btn__confirm"
                      @click="${(e) => this._thermostat_mouseclick(e)}"
                    >
                      ${confirm_btn}
                    </div>
                  </div>
                </div>
                <div
                  id="thermostat"
                  class="tado-card-middle thermostat"
                  @mousedown="${() => this._thermostat_mousedown()}"
                  @mouseup="${() => this._thermostat_mouseup()}"
                  @click="${(e) => this._thermostat_mouseclick(e)}"
                >
                  <div class="thermostat_part_top tempoverview">
                    <span style="pointer-events: none;">${thermostat__header}</span>
                  </div>
                  <div class="thermostat_part_middle tempoverview">
                    <div class="text text_maintemp">
                      ${thermostat__body}
                    </div>

                    <div id="track" class="track" style="height: ${track_height};"></div>
                    ${this.temp_selection
            ? html `
                          <input
                            id="tempvaluerange"
                            class="tempvaluerange"
                            type="range"
                            min="${min_temp - 1}"
                            max="${max_temp}"
                            step="1"
                            style="width: 444px; height: 300px; transform-origin: 222px 222px;"
                            @change="${(e) => this._change_track(e)}"
                            @input="${(e) => this._change_track(e)}"
                          />
                        `
            : ``}
                  </div>
                  <div class="thermostat_part_bottom tempoverview">
                    <div class="heatreq">
                      ${heat_request}
                    </div>
                    <div class="overlay">
                      <div class="overlay_text">
                        Manual Override Active
                      </div>
                      <button class="btn__cancel">Cancel</button>
                    </div>
                  </div>
                </div>
                <div class="tado-card-bottom">
                  <div class="info">
                    <div class="info_sensor">
                      <div class="info_sensor_label">Inside now</div>
                      <div class="info_sensor_value">${current_temperature}&#176;</div>
                    </div>
                    <div class="info_sensor">
                      <div class="info_sensor_label">Humidity</div>
                      <div class="info_sensor_value">${parseInt(current_humidity)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }
    _thermostat_mouseclick(e = null) {
        /**
         * Main mouse event handler for thermostat popup
         */
        const thermostat = this.shadowRoot;
        let toggle = false;
        // Handle Cancel Button on main popup when overlay active
        if (e !== null && this._isCancelOverrideButton(e.target)) {
            this._handleModeClick();
            thermostat.getElementById('popup').classList.add('temp-backed');
        }
        // Handle main thermostat click
        if (e !== null && this._isTempOverview(e.target)) {
            console.log('TOGGLE CALLED');
            toggle = true;
        }
        // Handle Back Button when setting temperature
        if (e !== null && this._isBackButton(e.target)) {
            this.shadowRoot.getElementById('popup').className = this.shadowRoot
                .getElementById('popup')
                .className.replace(/temp.*/g, '');
            thermostat.getElementById('popup').classList.add('temp-backed');
            thermostat.getElementById('popup').classList.add(this.temp_class);
            toggle = true;
        }
        // Handle Confirmation Button when setting temperature
        if (e !== null && this._isConfirmButton(e.target)) {
            this._setTemperature(this.temp_wanted);
            this.shadowRoot.getElementById('popup').className = this.shadowRoot
                .getElementById('popup')
                .className.replace(/temp.*/g, '');
            thermostat.getElementById('popup').classList.add('temp-backed');
            thermostat.getElementById('popup').classList.add('temp-' + this.temp_wanted.toString());
            console.log('CONFIRM CALLED');
            toggle = true;
        }
        // toggle thermostat view
        if (toggle) {
            const oldVal = this.temp_selection;
            if (this.temp_selection) {
                this.temp_selection = false;
                thermostat.getElementById('popup').classList.remove('settemp');
                thermostat.getElementById('popup').classList.add('temp-backed');
                this.requestUpdate('temp_selection', oldVal);
            }
            else {
                this.temp_selection = true;
                thermostat.getElementById('popup').classList.add('settemp');
                thermostat.getElementById('popup').classList.remove('temp-backed');
                this.requestUpdate('temp_selection', oldVal);
            }
        }
    }
    _isCancelOverrideButton(target) {
        /**
         * Temperature Override Cancel button check
         */
        const cancelOverrideClass = 'btn__cancel';
        const exists = target.classList.contains(cancelOverrideClass);
        return exists;
    }
    _isAirQualityButton(target) {
        /**
         * Temperature Override Cancel button check
         */
        const airQualityClass = 'btn__airqual';
        const exists = target.classList.contains(airQualityClass);
        return exists;
    }
    _isTempOverview(target) {
        /**
         * Temperature Override Cancel button check
         */
        const tempoverview = 'tempoverview';
        const exists = target.classList.contains(tempoverview);
        return exists;
    }
    _isBackButton(target) {
        /**
         * Temperature Slider Back button check
         */
        const backBtnClass = 'btn__back';
        const exists = target.classList.contains(backBtnClass);
        return exists;
    }
    _isConfirmButton(target) {
        /**
         * Temperature Slider Confirmation button check
         */
        const confirmBtnClass = 'btn__confirm';
        const exists = target.classList.contains(confirmBtnClass);
        return exists;
    }
    firstUpdated() {
        /**
         * First Update Handler.
         */
    }
    updated() {
        /**
         * Main updater handler.
         */
        this.temp_overlay = this._getOverlayState(this.hass.states[this.config.overlay]);
        this.temp_heating = this._getHeatingState(this.hass.states[this.config.heating]);
    }
    _thermostat_mousedown() {
        /**
         * Mouse Down Animation helper.
         */
        this.shadowRoot.getElementById('thermostat').classList.add('mousedown');
    }
    _thermostat_mouseup() {
        /**
         * Mouse Up animation helper.
         */
        this.shadowRoot.getElementById('thermostat').classList.remove('mousedown');
    }
    _change_track(e) {
        /**
         * Sets the SVG track on the temperature picker.
         */
        this.shadowRoot.getElementById('track').style.height = ((100 / 21) * (e.srcElement.value - 4)).toString() + '%';
        const temp_string = e.srcElement.value.toString();
        const temp_string_deg = e.srcElement.value.toString() + '&#176;';
        if (e.srcElement.value - 4 > 0) {
            this.shadowRoot.getElementById('popup').className = this.shadowRoot
                .getElementById('popup')
                .className.replace(/temp.*/g, '');
            this.shadowRoot.getElementById('popup').classList.add('temp-' + temp_string);
            this.shadowRoot.getElementById('target_temp_track').innerHTML = temp_string_deg;
            this.temp_wanted = e.srcElement.value;
        }
        else {
            this.shadowRoot.getElementById('popup').className = this.shadowRoot
                .getElementById('popup')
                .className.replace(/temp.*/g, '');
            this.shadowRoot.getElementById('popup').classList.add('temp-off');
            this.shadowRoot.getElementById('target_temp_track').innerHTML = 'OFF';
            this.temp_wanted = e.srcElement.value;
        }
    }
    _getHeatingState(heatingObj) {
        const heat_percent = parseInt(heatingObj.state);
        let heat_class = 'heating_off';
        if (heat_percent == 0) {
            return heat_class;
        }
        else if (heat_percent <= 33) {
            heat_class = 'heating_one';
            return heat_class;
        }
        else if (heat_percent <= 66) {
            heat_class = 'heating_two';
            return heat_class;
        }
        else if (heat_percent <= 100) {
            heat_class = 'heating_three';
            return heat_class;
        }
        else {
            heat_class = 'heating_err';
            return heat_class;
        }
    }
    _getOverlayState(overlayObj) {
        /**
         * Correctly sets the Overlay boolean as it reads it as a string
         */
        const isTrueSet = overlayObj.state === 'True';
        return isTrueSet;
    }
    _setTemperature(temperature) {
        /**
         * Calls the Home Assistant set_temperature service.
         */
        if (!this.hass) {
            throw new Error('Unable to update temperature');
        }
        return this.hass.callService('climate', 'set_temperature', {
            entity_id: this.config.entity,
            temperature: temperature,
        });
    }
    _handleModeClick() {
        /**
         * Sets the Tado thermostat back to auto mode.
         */
        if (!this.hass) {
            throw new Error('Unable to update climate mode');
        }
        return this.hass.callService('climate', 'set_hvac_mode', {
            entity_id: this.config.entity,
            hvac_mode: 'auto',
        });
    }
    setConfig(config) {
        /**
         * Imports and sets up configuration
         */
        if (!config) {
            throw new Error('Invalid configuration');
        }
        if (!config.entity) {
            throw new Error('You need to define a climate entity via entity: <entity>');
        }
        if (!config.heating) {
            throw new Error('You need to define a heating entity via heating: <entity>');
        }
        if (!config.overlay) {
            throw new Error('You need to define an overlay entity via overlay: <entity>');
        }
        this.config = config;
    }
    getCardSize() {
        return 1;
    }
    static get styles() {
        return [style({ css })];
    }
};
__decorate([
    property({ type: Object })
], TadoPopupCard.prototype, "hass", void 0);
__decorate([
    property({ type: Object })
], TadoPopupCard.prototype, "config", void 0);
TadoPopupCard = __decorate([
    customElement('tadothermostatpopup-card')
], TadoPopupCard);

export { TadoPopupCard };

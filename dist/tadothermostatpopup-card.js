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
/**
 * Brands a function as a directive factory function so that lit-html will call
 * the function during template rendering, rather than passing as a value.
 *
 * A _directive_ is a function that takes a Part as an argument. It has the
 * signature: `(part: Part) => void`.
 *
 * A directive _factory_ is a function that takes arguments for data and
 * configuration and returns a directive. Users of directive usually refer to
 * the directive factory as the directive. For example, "The repeat directive".
 *
 * Usually a template author will invoke a directive factory in their template
 * with relevant arguments, which will then return a directive function.
 *
 * Here's an example of using the `repeat()` directive factory that takes an
 * array and a function to render an item:
 *
 * ```js
 * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
 * ```
 *
 * When `repeat` is invoked, it returns a directive function that closes over
 * `items` and the template function. When the outer template is rendered, the
 * return directive function is called with the Part for the expression.
 * `repeat` then performs it's custom logic to render multiple items.
 *
 * @param f The directive factory function. Must be a function that returns a
 * function of the signature `(part: Part) => void`. The returned function will
 * be called with the part object.
 *
 * @example
 *
 * import {directive, html} from 'lit-html';
 *
 * const immutable = directive((v) => (part) => {
 *   if (part.value !== v) {
 *     part.setValue(v)
 *   }
 * });
 */

const directive = f => (...args) => {
  const d = f(...args);
  directives.set(d, true);
  return d;
};
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

class ClassList {
  constructor(element) {
    this.classes = new Set();
    this.changed = false;
    this.element = element;
    const classList = (element.getAttribute('class') || '').split(/\s+/);

    for (const cls of classList) {
      this.classes.add(cls);
    }
  }

  add(cls) {
    this.classes.add(cls);
    this.changed = true;
  }

  remove(cls) {
    this.classes.delete(cls);
    this.changed = true;
  }

  commit() {
    if (this.changed) {
      let classString = '';
      this.classes.forEach(cls => classString += cls + ' ');
      this.element.setAttribute('class', classString);
    }
  }

}
/**
 * Stores the ClassInfo object applied to a given AttributePart.
 * Used to unset existing values when a new ClassInfo object is applied.
 */


const previousClassesCache = new WeakMap();
/**
 * A directive that applies CSS classes. This must be used in the `class`
 * attribute and must be the only part used in the attribute. It takes each
 * property in the `classInfo` argument and adds the property name to the
 * element's `class` if the property value is truthy; if the property value is
 * falsey, the property name is removed from the element's `class`. For example
 * `{foo: bar}` applies the class `foo` if the value of `bar` is truthy.
 * @param classInfo {ClassInfo}
 */

const classMap = directive(classInfo => part => {
  if (!(part instanceof AttributePart) || part instanceof PropertyPart || part.committer.name !== 'class' || part.committer.parts.length > 1) {
    throw new Error('The `classMap` directive must be used in the `class` attribute ' + 'and must be the only part in the attribute.');
  }

  const {
    committer
  } = part;
  const {
    element
  } = committer;
  let previousClasses = previousClassesCache.get(part);

  if (previousClasses === undefined) {
    // Write static classes once
    // Use setAttribute() because className isn't a string on SVG elements
    element.setAttribute('class', committer.strings.join(' '));
    previousClassesCache.set(part, previousClasses = new Set());
  }

  const classList = element.classList || new ClassList(element); // Remove old classes that no longer apply
  // We use forEach() instead of for-of so that re don't require down-level
  // iteration.

  previousClasses.forEach(name => {
    if (!(name in classInfo)) {
      classList.remove(name);
      previousClasses.delete(name);
    }
  }); // Add or remove classes based on their classMap value

  for (const name in classInfo) {
    const value = classInfo[name];

    if (value != previousClasses.has(name)) {
      // We explicitly want a loose truthy check of `value` because it seems
      // more convenient that '' and 0 are skipped.
      if (value) {
        classList.add(name);
        previousClasses.add(name);
      } else {
        classList.remove(name);
        previousClasses.delete(name);
      }
    }
  }

  if (typeof classList.commit === 'function') {
    classList.commit();
  }
});

function hass() {
  if (document.querySelector('hc-main')) return document.querySelector('hc-main').hass;
  if (document.querySelector('home-assistant')) return document.querySelector('home-assistant').hass;
  return undefined;
}
function lovelace_view() {
  var root = document.querySelector("hc-main");

  if (root) {
    root = root && root.shadowRoot;
    root = root && root.querySelector("hc-lovelace");
    root = root && root.shadowRoot;
    root = root && root.querySelector("hui-view") || root.querySelector("hui-panel-view");
    return root;
  }

  root = document.querySelector("home-assistant");
  root = root && root.shadowRoot;
  root = root && root.querySelector("home-assistant-main");
  root = root && root.shadowRoot;
  root = root && root.querySelector("app-drawer-layout partial-panel-resolver");
  root = root && root.shadowRoot || root;
  root = root && root.querySelector("ha-panel-lovelace");
  root = root && root.shadowRoot;
  root = root && root.querySelector("hui-root");
  root = root && root.shadowRoot;
  root = root && root.querySelector("ha-app-layout");
  root = root && root.querySelector("#view");
  root = root && root.firstElementChild;
  return root;
}
async function load_lovelace() {
  if (customElements.get("hui-view")) return true;
  await customElements.whenDefined("partial-panel-resolver");
  const ppr = document.createElement("partial-panel-resolver");
  ppr.hass = {
    panels: [{
      url_path: "tmp",
      "component_name": "lovelace"
    }]
  };

  ppr._updateRoutes();

  await ppr.routerOptions.routes.tmp.load();
  if (!customElements.get("ha-panel-lovelace")) return false;
  const p = document.createElement("ha-panel-lovelace");
  p.hass = hass();

  if (p.hass === undefined) {
    await new Promise(resolve => {
      window.addEventListener('connection-status', ev => {
        console.log(ev);
        resolve();
      }, {
        once: true
      });
    });
    p.hass = hass();
  }

  p.panel = {
    config: {
      mode: null
    }
  };

  p._fetchConfig();

  return true;
}

async function _selectTree(root, path, all = false) {
  let el = root;

  if (typeof path === "string") {
    path = path.split(/(\$| )/);
  }

  for (const [i, p] of path.entries()) {
    if (!p.trim().length) continue;
    if (!el) return null;
    if (el.localName && el.localName.includes("-")) await customElements.whenDefined(el.localName);
    if (el.updateComplete) await el.updateComplete;
    if (p === "$") {
      if (all && i == path.length - 1) el = [el.shadowRoot];else el = el.shadowRoot;
    } else if (all && i == path.length - 1) el = el.querySelectorAll(p);else el = el.querySelector(p);
  }

  return el;
}

async function selectTree(root, path, all = false, timeout = 10000) {
  return Promise.race([_selectTree(root, path, all), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))]).catch(err => {
    if (!err.message || err.message !== "timeout") throw err;
    return null;
  });
}

function fireEvent(ev, detail, entity = null) {
  ev = new Event(ev, {
    bubbles: true,
    cancelable: false,
    composed: true
  });
  ev.detail = detail || {};

  if (entity) {
    entity.dispatchEvent(ev);
  } else {
    var root = lovelace_view();
    if (root) root.dispatchEvent(ev);
  }
}

let helpers = window.cardHelpers;
const helperPromise = new Promise(async (resolve, reject) => {
  if (helpers) resolve();

  const updateHelpers = async () => {
    helpers = await window.loadCardHelpers();
    window.cardHelpers = helpers;
    resolve();
  };

  if (window.loadCardHelpers) {
    updateHelpers();
  } else {
    // If loadCardHelpers didn't exist, force load lovelace and try once more.
    window.addEventListener("load", async () => {
      load_lovelace();

      if (window.loadCardHelpers) {
        updateHelpers();
      }
    });
  }
});

async function closePopUp() {
  const root = document.querySelector("home-assistant") || document.querySelector("hc-root");
  fireEvent("hass-more-info", {
    entityId: "."
  }, root);
  const el = await selectTree(root, "$ card-tools-popup");
  if (el) el.closeDialog();
}

const animation_styling = css `
  @keyframes popup_grow {
    0% {
      height: 540px;
    }
    100% {
      height: 600px;
    }
  }
  @keyframes popup_shrink {
    0% {
      height: 600px;
    }
    100% {
      height: 540px;
    }
  }

  @keyframes temp_slider_start {
    0% {
      height: 300px;
      top: -80px;
    }
    100% {
      height: 400px;
      top: 0px;
    }
  }
  @keyframes tempend {
    0% {
      /* min-height: 400px; */
      opacity: 0;
      transform: translate(0%, 10%);
    }
    100% {
      /* min-height: 300px; */
      opacity: 1;
      transform: translate(0%, 0%);
    }
  }
  @keyframes track_fadein {
    0% {
      opacity: 0;
      transform: translate(0%, 500%);
    }
    50% {
      opacity: 0.5;
      transform: translate(0%, 200%);
    }
    75% {
      opacity: 1;
      transform: translate(0%, 50%);
    }
    85% {
      opacity: 1;
      transform: translate(0%, 20%);
    }
    100% {
      opacity: 1;
      transform: translate(0%, 0%);
    }
  }
`;

const shared_styling = css ``;

const slider_styling = css `
  .track {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="450" height="472" viewBox="0 0 450 472" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M199 22L0 22L3.93402e-05 472L450 472L450 22H251C251 36.3594 239.359 48 225 48C210.641 48 199 36.3594 199 22Z"    fill="white"  /><path fill-rule="evenodd" clip-rule="evenodd" d="M203 22C203 9.84974 212.85 0 225 0C237.15 0 247 9.84974 247 22C247 34.1503 237.15 44 225 44C212.85 44 203 34.1503 203 22ZM220 12L218.5 10.5L225 4L231.5 10.5L230 12L225 7L220 12ZM231.5 33.5L230 32L225 37L220 32L218.5 33.5L225 40L231.5 33.5Z"    fill="white"  /></svg>');
    background-position: center 0;
    background-repeat: no-repeat;
    background-clip: padding-box;
    padding: 22px 0 0;
    box-sizing: content-box;
    animation: 1s ease-out 0s 1 track_fadein;
  }
  /* Animation upon exiting the thermostat */
  .popup-inner.backed #thermostat {
    animation: 0.5s ease-in 0s 1 tempend;
  }
  /* Make sure svg is not passed into mouseclick events */
  .btn-confirm svg,
  .btn-back svg {
    pointer-events: none;
  }
`;

const thermostat_styling = css `
  /* :host {
    --heat-color: #ee7600;
    --manual-color: #44739e;
    --off-color: lightgrey;
    --fan_only-color: #8a8a8a;
    --dry-color: #efbd07;
    --idle-color: #00cc66;
    --unknown-color: #bac;
  } */
  :host *:focus {
    outline: -webkit-focus-ring-color auto 0px;
  }

  .popup-inner {
    max-width: 400px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    overflow: hidden;
  }
  .popup-inner.settemp {
    animation: 0.5s ease-out 0s 1 popup_grow;
  }
  .popup-inner.backed {
    animation: 0.5s ease-out 0s 1 popup_shrink;
  }

  .popup-inner.off {
    display: none;
  }
  #settings {
    display: none;
  }
  .settings-inner {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  #settings.on {
    display: flex;
  }
  .settings-btn {
    position: absolute;
    right: 30px;
    background-color: #7f8082;
    color: #fff;
    border: 0;
    padding: 5px 20px;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
  }
  .settings-btn.bottom {
    bottom: 15px;
  }
  .settings-btn.top {
    top: 25px;
  }
  .settings-btn.bottom.fullscreen {
    margin: 0;
  }
  .fullscreen {
    margin-top: -64px;
  }
  .info {
    display: flex;
    flex-direction: row;
    margin-bottom: 40px;
    height: 100px;
  }
  .info .temp {
    background-color: #67cd67;
    height: 60px;
    width: 60px;
    text-align: center;
    line-height: 60px;
    border-radius: 100%;
    color: #fff;
    font-size: 18px;
  }

  .info .temp.heat_cool {
    background-color: var(--auto-color);
  }
  .info .temp.cool {
    background-color: var(--cool-color);
  }
  .info .temp.heat {
    background-color: var(--heat-color);
  }
  .info .temp.manual {
    background-color: var(--manual-color);
  }
  .info .temp.off {
    background-color: var(--off-color);
  }
  .info .temp.fan_only {
    background-color: var(--fan_only-color);
  }
  .info .temp.eco {
    background-color: var(--eco-color);
  }
  .info .temp.dry {
    background-color: var(--dry-color);
  }
  .info .temp.idle {
    background-color: var(--idle-color);
  }
  .info .temp.unknown-mode {
    background-color: var(--unknown-color);
  }

  .info .right {
    display: flex;
    flex-direction: column;
    margin-left: 15px;
    height: 60px;
    align-items: center;
    justify-content: center;
  }
  .info .right .name {
    color: #fff;
    font-size: 24px;
  }
  .info .right .action {
    color: #8b8a8f;
    font-size: 12px;
  }

  /* CONTROLS */

  .heat_cool {
    --mode-color: var(--auto-color);
  }
  .cool {
    --mode-color: var(--cool-color);
  }
  .heat {
    --mode-color: var(--heat-color);
  }
  .manual {
    --mode-color: var(--manual-color);
  }
  .off {
    --mode-color: var(--off-color);
  }
  .fan_only {
    --mode-color: var(--fan_only-color);
  }
  .eco {
    --mode-color: var(--eco-color);
  }
  .dry {
    --mode-color: var(--dry-color);
  }
  .idle {
    --mode-color: var(--idle-color);
  }
  .unknown-mode {
    --mode-color: var(--unknown-color);
  }
  #controls {
    display: flex;
    justify-content: center;
    /* padding: 16px; */
    position: relative;
    /* width: 500px; */
    width: 100%;
  }
  /* #slider {
    height: 100%;
    width: 100%;
    position: relative;
    max-width: 300px;
    min-width: 250px;
  }
  round-slider {
    --round-slider-path-color: var(--disabled-text-color);
    --round-slider-bar-color: var(--mode-color);
    padding-bottom: 10%;
  }
  #slider-center {
    position: absolute;
    width: calc(100% - 120px);
    height: calc(100% - 120px);
    box-sizing: border-box;
    border-radius: 100%;
    left: 60px;
    top: 60px;
    text-align: center;
    overflow-wrap: break-word;
    pointer-events: none;
  } */

  /* .values {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }
  .values .action {
    color: #f4b941;
    font-size: 10px;
    text-transform: uppercase;
  }
  .values .value {
    color: #fff;
    font-size: 60px;
    line-height: 60px;
  }

  #modes > * {
    color: var(--disabled-text-color);
    cursor: pointer;
    display: inline-block;
  }
  #modes .selected-icon {
    --iron-icon-fill-color: var(--mode-color);
  } */
  text {
    color: var(--primary-text-color);
  }
  /* Bottom Card Sensors Panel */
  .sensors-container {
    min-height: 64px;
    display: flex;
    flex: 1 1 120px;
    align-items: center;
    overflow: hidden;
  }
  .sensors {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
  }
  .sensor {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100px;
  }
  .sensor__label {
    font-size: 0.85em;
    opacity: 0.6;
    text-transform: uppercase;
    height: 2em;
    display: flex;
    text-align: center;
    align-items: center;
  }
  .sensor__value .b-temperature,
  .sensor__value .b-humidity {
    font-size: 2rem;
    line-height: 2rem;
    font-weight: 700;
  }
  /* Main Popup Top */
  .thermostat__body .b-temperature {
    font-weight: 700;
  }

  .popup-inner {
    color: white;
  }
  /* Thermostat Colors START */
  .popup-inner.temp-off {
    background: linear-gradient(rgb(159, 179, 194), rgb(104, 131, 150));
  }
  .popup-inner.temp-5 {
    background: linear-gradient(rgb(60, 150, 114), rgb(60, 134, 139));
  }
  .popup-inner.temp-6 {
    background: linear-gradient(rgb(60, 153, 115), rgb(57, 139, 142));
  }
  .popup-inner.temp-7 {
    background: linear-gradient(rgb(60, 158, 116), rgb(54, 144, 143));
  }
  .popup-inner.temp-8 {
    background: linear-gradient(rgb(61, 162, 117), rgb(51, 147, 142));
  }
  .popup-inner.temp-9 {
    background: linear-gradient(rgb(61, 166, 117), rgb(48, 149, 140));
  }
  .popup-inner.temp-10 {
    background: linear-gradient(rgb(61, 170, 118), rgb(45, 152, 138));
  }
  .popup-inner.temp-11 {
    background: linear-gradient(rgb(62, 174, 118), rgb(42, 154, 135));
  }
  .popup-inner.temp-12 {
    background: linear-gradient(rgb(62, 178, 119), rgb(40, 157, 132));
  }
  .popup-inner.temp-13 {
    background: linear-gradient(rgb(62, 182, 119), rgb(37, 159, 129));
  }
  .popup-inner.temp-14 {
    background: linear-gradient(rgb(62, 187, 119), rgb(34, 162, 125));
  }
  .popup-inner.temp-15 {
    background: linear-gradient(rgb(62, 191, 119), rgb(31, 164, 120));
  }
  .popup-inner.temp-16 {
    background: linear-gradient(rgb(63, 194, 119), rgb(28, 166, 116));
  }
  .popup-inner.temp-17 {
    background: linear-gradient(rgb(66, 196, 120), rgb(26, 169, 110));
  }
  .popup-inner.temp-18 {
    background: linear-gradient(rgb(68, 198, 120), rgb(23, 171, 105));
  }
  .popup-inner.temp-19 {
    background: linear-gradient(rgb(255, 208, 0), rgb(255, 187, 0));
  }
  .popup-inner.temp-20 {
    background: linear-gradient(rgb(255, 197, 0), rgb(255, 170, 0));
  }
  .popup-inner.temp-21 {
    background: linear-gradient(rgb(255, 186, 0), rgb(255, 153, 0));
  }
  .popup-inner.temp-22 {
    background: linear-gradient(rgb(255, 174, 0), rgb(255, 136, 0));
  }
  .popup-inner.temp-23 {
    background: linear-gradient(rgb(255, 163, 0), rgb(255, 119, 0));
  }
  .popup-inner.temp-24 {
    background: linear-gradient(rgb(255, 152, 0), rgb(255, 102, 0));
  }
  .popup-inner.temp-25 {
    background: linear-gradient(rgb(255, 140, 0), rgb(255, 85, 0));
  }
  /* Thermostat Colors END */
  .tado-card {
    display: flex;
    flex-direction: column;
    flex: 1 1 400px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  }

  .room-thermostat-area:hover,
  .room-thermostat-area--slider:hover {
    transform: scale(1.03);
  }
  .room-thermostat-area.mousedown {
    transform: scale(0.95);
  }
  .room-thermostat-area {
    background-color: hsla(0, 0%, 100%, 0.2);
    box-shadow: 0 0 30px hsla(0, 0%, 39.2%, 0.2);
    transition: transform 0.15s ease, box-shadow 0.15s ease, flex-basis 0.3s ease-out;
    will-change: transform;
    flex: 0 1 300px;
    position: relative;
    width: 100%;
    max-width: 300px;
    height: 300px;
    margin-top: 30px;
    background-color: hsla(0, 0%, 100%, 0.1);
    border-radius: 75px;
    overflow: hidden;
  }
  .thermostat {
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    text-align: center;
  }
  .thermostat__header_and_body {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: absolute;
    width: 100%;
  }
  .thermostat__header_and_body {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .thermostat__header_and_body[role='button'] {
    cursor: pointer;
  }
  .thermostat__header {
    flex-basis: 0;
    height: 0;
    position: relative;
    top: 14px;
    opacity: 0.6;
    transition: height 0.3s ease-in-out, top 0.3s ease-in-out, padding-top 0.3s ease-in-out;
  }

  :host([temp_overlay]) .thermostat__body {
    font-size: 5.5em;
  }

  .thermostat__body {
    position: relative;
    font-size: 6em;
    overflow: hidden;
    flex-basis: 100%;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    transition-property: width; /* Apply transition effect on the width */
    transition-duration: 1s; /* Transition will last 1 second */
    transition-timing-function: linear; /* Timing function to specify a linear transition type */
    transition-delay: 0s; /* Transition starts after 1 second */
  }
  :host([temp_overlay]) .thermostat__footer {
    display: block;
    flex: 0 0 35%;
  }
  .thermostat__footer {
    display: none;
    background-color: #fff;
    color: #213953;
  }
  .thermostat__footercontent {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-flow: column;
    height: 100%;
    padding: 1em;
  }
  .thermostat__footer_termination_content_text {
    text-align: center;
    padding: 10px;
  }

  .btn {
    display: inline-block;
    color: #fff;
    font-size: 0.9em;
    text-decoration: none;
    text-align: left;
    line-height: 2.5;
    padding: 0 1.5em;
    border-radius: 1.25em;
    border: none;
    transition: background-color 0.1s ease, box-shadow 0.15s ease;
  }

  .btn--cancel {
    color: #213953;
    border: 1px solid #213953;
    text-align: center;
    background-color: #fff;
    min-width: 144px;
    margin-bottom: 10px;
  }

  :host([temp_overlay]) .app-heat-request-indicator {
    bottom: 20px;
  }
  .app-heat-request-indicator {
    position: absolute;
    display: inline-flex;
    bottom: 33px;
  }
  .app-heat-request-indicator svg path {
    opacity: 0.38;
    fill: #fff;
  }
  /* Temperature Slider */
  .tado-card--slider {
    flex: 0 1 400px;
    background-color: hsla(0, 0%, 100%, 0.2);
    box-shadow: 0 0 30px hsla(0, 0%, 39.2%, 0.2);
    /* transition: transform 0.15s ease, box-shadow 0.15s ease, flex-basis 0.3s ease-out; */
    /* will-change: transform; */
    width: 100%;
    /* max-height: 120px; */
    overflow: hidden;
    min-height: 600px;
  }

  .temperature-slider--header {
    /* position: absolute; */
    /* left: 0; */
    /* right: 0; */
    /* top: 0; */
    height: 120px;
    display: flex;
  }
  .temperature-slider--toolbar {
    padding: 18px;
    position: absolute;
    width: calc(100% - 36px);
    display: flex;
    justify-content: space-between;
  }
  .panel-btn {
    width: 2em;
    height: 2em;
    border-radius: 2em;
    fill: hsla(0, 0%, 100%, 0.2);
  }
  .temperature-slider--header .value-label {
    font-size: 55px;
    align-self: center;
    flex: 1 1 auto;
    text-align: center;
    text-transform: uppercase;
  }
  .room-thermostat-area--slider {
    flex: 0 1 400px;
    background-color: hsla(0, 0%, 100%, 0.2);
    box-shadow: 0 0 30px hsla(0, 0%, 39.2%, 0.2);
    transition: transform 0.15s ease, box-shadow 0.15s ease, flex-basis 0.3s ease-out;
    will-change: transform;
    position: relative;
    width: 100%;
    max-width: 300px;
    /* height: 300px; */
    /* margin-top: 30px; */
    margin: 30px auto 60px auto;
    border-radius: 75px;
    overflow: hidden;
  }
  .app-temperature-slider {
    /* width: 300px;
    height: 400px; */
    position: relative;
    top: 0;
    opacity: 1;
    left: 50%;
    transform: translateX(-50%);
    animation: 0.5s ease-out 0s 1 temp_slider_start;
  }
  input[type='range'] {
    background-color: transparent;
    -webkit-appearance: none;
    transform: rotate(-90deg);
    -ms-writing-mode: bt-lr;
    writing-mode: bt-lr;
    position: absolute;
    top: -22px;
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: 1px solid #000000;
    height: 36px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
    margin-top: -14px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; /* Add cool effects to your sliders! */
    visibility: hidden;
  }

  /* All the same stuff for Firefox */
  input[type='range']::-moz-range-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 36px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
    visibility: hidden;
  }

  /* All the same stuff for IE */
  input[type='range']::-ms-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 36px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
    visibility: hidden;
  }

  /* app-toolbar {
    color: var(--primary-text-color);
    background-color: linear-gradient(rgb(159, 179, 194), rgb(104, 131, 150));
  } */
  /* Main Popup Top */
`;

// import { computeRTLDirection } from 'custom-card-helpers';
// import { computeStateDisplay, computeStateName } from 'custom-card-helpers';
class TadoPopupCard extends LitElement {
    constructor() {
        super();
        this.hvacModeOrdering = {
            // 0: "off",
            // 1: "auto",
            // 2: "heat"
            auto: 1,
            heat: 2,
            off: 3,
        };
        this.modeIcons = {
            auto: 'hass:calendar-repeat',
            // auto: 'mdi:repeat',
            // heat_cool: 'hass:autorenew',
            heat: 'hass:fire',
            // cool: 'hass:snowflake',
            off: 'hass:power',
        };
        this.settings = false;
        this.settingsCustomCard = false;
        this.settingsPosition = 'bottom';
        this.temp_wanted = 0;
        this.temp_class = 'temp-off';
        this.temp_selection = false;
        this.temp_overlay = false;
        this.dragging = false;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    static get properties() {
        return {
            hass: {},
            config: {},
            active: {},
            temp_selection: { type: Boolean },
            temp_overlay: { type: Boolean, reflect: true },
            temp_class: { type: String },
            temp_wanted: { type: Number, reflect: true },
            dragging: { type: Boolean, reflect: true },
        };
    }
    render() {
        this.temp_wanted = 0;
        const entity = this.config.entity;
        const stateObj = this.hass.states[entity];
        const currentTemp = stateObj.attributes.current_temperature;
        // console.log(stateObj);
        // const icon = this.config.icon
        //   ? this.config.icon
        //   : stateObj.attributes.icon
        //   ? stateObj.attributes.icon
        //   : 'mdi:lightbulb';
        // REAL DATA
        // const name = this.config.name || stateObj.attributes.friendly_name;
        const targetTemp = stateObj.attributes.temperature !== null && stateObj.attributes.temperature
            ? stateObj.attributes.temperature
            : stateObj.attributes.min_temp;
        // const max_temp = stateObj.attributes.max_temp;
        // const min_temp = stateObj.attributes.min_temp;
        // const preset_mode = stateObj.attributes.preset_mode;
        // const preset_modes = stateObj.attributes.preset_modes;
        const currentHum = parseInt(stateObj.attributes.current_humidity);
        // const hvac_action = stateObj.attributes.hvac_action;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let mode = '';
        mode = stateObj.state in this.modeIcons ? stateObj.state : 'unknown-mode';
        let thermostat__body;
        let thermostat__target;
        let thermostat__header;
        if (stateObj.attributes.hvac_action == 'off') {
            mode = 'off';
            thermostat__header = 'Frost Protection';
            thermostat__target = 0;
            thermostat__body = 'OFF';
        }
        else if (stateObj.attributes.hvac_action == 'heating') {
            mode = 'heat';
            thermostat__header = 'Set to';
            thermostat__body = targetTemp.toString() + '°';
            thermostat__target = targetTemp;
        }
        else if (stateObj.attributes.hvac_action == 'idle') {
            mode = 'idle';
            thermostat__header = 'Set to';
            thermostat__body = targetTemp.toString() + '°';
            thermostat__target = targetTemp;
        }
        else {
            mode = stateObj.state in this.modeIcons ? stateObj.state : 'unknown-mode';
            thermostat__header = 'No remote access';
            thermostat__body = 'replace with svg';
            thermostat__target = 0;
        }
        // let thermostat__class: string;
        if (stateObj.state in this.modeIcons) {
            if (stateObj.attributes.hvac_action == 'off') {
                this.temp_class = 'temp-off';
            }
            else {
                this.temp_class = 'temp-' + parseInt(targetTemp).toString();
            }
        }
        else {
            this.temp_class = 'disconnected';
        }
        const track_height = ((100 / 21) * (thermostat__target - 4)).toString() + '%';
        const fullscreen = 'fullscreen' in this.config ? this.config.fullscreen : true;
        this.settings = 'settings' in this.config ? true : false;
        this.settingsCustomCard = 'settingsCard' in this.config ? true : false;
        this.settingsPosition = 'settingsPosition' in this.config ? this.config.settingsPosition : 'bottom';
        if (this.settingsCustomCard && this.config.settingsCard.cardOptions) {
            if (this.config.settingsCard.cardOptions.entity && this.config.settingsCard.cardOptions.entity == 'this') {
                this.config.settingsCard.cardOptions.entity = entity;
            }
            else if (this.config.settingsCard.cardOptions.entity_id &&
                this.config.settingsCard.cardOptions.entity_id == 'this') {
                this.config.settingsCard.cardOptions.entity_id = entity;
            }
            else if (this.config.settingsCard.cardOptions.entities) {
                for (const key in this.config.settingsCard.cardOptions.entities) {
                    if (this.config.settingsCard.cardOptions.entities[key] == 'this') {
                        this.config.settingsCard.cardOptions.entities[key] = entity;
                    }
                }
            }
        }
        // console.log(this.active);
        return html `
      <div class="${fullscreen === true ? 'popup-wrapper' : ''}">
        <div class="${classMap({ [mode]: true })}" style="display:flex;width:100%;height:100%;">
          <!-- <div id="popup" class="popup-inner ${this.temp_class}" @click="${e => this._close(e)}"> -->
          <div id="popup" class="popup-inner ${this.temp_class}">
            ${this.temp_selection
            ? html `
                  <!-- Tado set temp START -->
                  <div class="tado-card--slider">
                    <div class="temperature-slider--header " style="">
                      <div class="temperature-slider--toolbar">
                        <div>
                          <div class="btn-back" @click="${e => this._thermostat_mouseclick(e)}">
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
                          </div>
                        </div>
                        <div class="btn-confirm" @click="${e => this._thermostat_mouseclick(e)}">
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
                        </div>
                      </div>
                      <div class="value-label">
                        <div class="app-temperature-display"></div>
                        <div class="">
                          <div id="target_temp_track" class="b-temperature">${thermostat__body}</div>
                        </div>
                      </div>
                    </div>
                    <div class="room-thermostat-area--slider" tabindex="0">
                      <div class="app-temperature-slider" style="width: 300px; height: 400px; opacity: 1;">
                        <div id="track" class="track" style="height: ${track_height};"></div>

                        <input
                          id="tempvaluerange"
                          type="range"
                          min="4"
                          max="25"
                          step="1"
                          style="width: 444px; height: 300px; transform-origin: 222px 222px;"
                          @change="${e => this._change_track(e)}"
                          @input="${e => this._change_track(e)}"
                        />
                      </div>
                    </div>
                  </div>
                  <!-- Tado set temp END -->
                `
            : html `
                  <!-- Tado Thermostat START -->
                  <div
                    class="tado-card"
                    @mousedown="${() => this._thermostat_mousedown()}"
                    @mouseup="${() => this._thermostat_mouseup()}"
                    @click="${e => this._thermostat_mouseclick(e)}"
                  >
                    <div id="thermostat" class="room-thermostat-area" tabindex="0">
                      <div class="thermostat">
                        <div role="button" class="thermostat__header_and_body ">
                          <div class="thermostat__header ">
                            <span>${thermostat__header}</span>
                          </div>
                          <div class="thermostat__body">
                            <span class="b-temperature  " style="text-transform: uppercase">${thermostat__body}</span>
                            <div class="app-heat-request-indicator">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                width="24"
                                height="24"
                              >
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
                            </div>
                          </div>
                          ${this.temp_overlay
                ? html `
                                <div class="thermostat__footer">
                                  <div class="thermostat__footer_termination_content_text">Manual Override Active</div>
                                  <button class="btn btn--cancel">Cancel</button>
                                </div>
                              `
                : html `
                                <div class="thermostat__footer" style="max-height: 0%; opacity: 0"></div>
                              `}
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Tado Thermostat END -->
                  <!-- Tado Sensors START -->
                  <div class="info">
                    <div class="sensors-container">
                      <div class="sensor">
                        <div class="temperature sensor__label">Inside now</div>
                        <div class="temperature sensor__value">
                          <div class="b-temperature">${currentTemp}&#176;</div>
                        </div>
                      </div>
                      <div class="sensor">
                        <div class="sensor__label">Humidity</div>
                        <div class="sensor__value">
                          <div class="b-humidity">${currentHum}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Tado Sensors END -->
                `}
          </div>
        </div>
      </div>
    `;
    }
    _thermostat_mouseclick(e = null) {
        if (e !== null && this._isCancelOverrideButton(e.target)) {
            // console.log('cancel');
            this._handleModeClick();
            return;
        }
        if (e !== null && this._isBackButton(e.target)) {
            // console.log('back');
            this.shadowRoot.getElementById('popup').className = this.shadowRoot
                .getElementById('popup')
                .className.replace(/temp.*/g, '');
            this.shadowRoot.getElementById('popup').classList.add(this.temp_class);
        }
        if (e !== null && this._isConfirmButton(e.target)) {
            // console.log('confirm');
            this._setTemperature(this.temp_wanted);
            this.shadowRoot.getElementById('popup').className = this.shadowRoot
                .getElementById('popup')
                .className.replace(/temp.*/g, '');
            this.shadowRoot.getElementById('popup').classList.add(this.temp_class);
        }
        // if (event.target.classList.contains('btn-confirm')) {
        //   console.log('set heat');
        //   this._setTemperature(this.temp_wanted);
        // }
        // if (event.target.classList.contains('btn-back')) {
        //   this.shadowRoot.getElementById('popup').className = this.shadowRoot
        //     .getElementById('popup')
        //     .className.replace(/temp.*/g, '');
        //   this.shadowRoot.getElementById('popup').classList.add(this.temp_class);
        // }
        // console.log(e);
        const thermostat = this.shadowRoot;
        if (this.temp_selection) {
            this.temp_selection = false;
            thermostat.getElementById('popup').classList.remove('settemp');
            thermostat.getElementById('popup').classList.add('backed');
        }
        else {
            this.temp_selection = true;
            thermostat.getElementById('popup').classList.add('settemp');
            thermostat.getElementById('popup').classList.remove('backed');
        }
    }
    _isCancelOverrideButton(target) {
        // console.log({ target });
        const cancelOverrideClass = 'btn--cancel';
        const exists = target.classList.contains(cancelOverrideClass);
        return exists;
    }
    _isBackButton(target) {
        // console.log({ target });
        const BackBtnClass = 'btn-back';
        const exists = target.classList.contains(BackBtnClass);
        return exists;
    }
    _isConfirmButton(target) {
        // console.log({ target });
        const confirmBtnClass = 'btn-confirm';
        const exists = target.classList.contains(confirmBtnClass);
        return exists;
    }
    firstUpdated() {
        if (this.settings && !this.settingsCustomCard) {
            const mic = this.shadowRoot.querySelector('more-info-controls').shadowRoot;
            mic.removeChild(mic.querySelector('app-toolbar'));
        }
        else if (this.settings && this.settingsCustomCard) {
            this.shadowRoot.querySelectorAll('card-maker').forEach(customCard => {
                let card = {
                    type: customCard.dataset.card,
                };
                card = Object.assign({}, card, JSON.parse(customCard.dataset.options));
                customCard.config = card;
                let style = '';
                if (customCard.dataset.style) {
                    style = customCard.dataset.style;
                }
                if (style != '') {
                    let itterations = 0;
                    const interval = setInterval(function () {
                        const el = customCard.children[0];
                        if (el) {
                            window.clearInterval(interval);
                            const styleElement = document.createElement('style');
                            styleElement.innerHTML = style;
                            el.shadowRoot.appendChild(styleElement);
                        }
                        else if (++itterations === 10) {
                            window.clearInterval(interval);
                        }
                    }, 100);
                }
            });
        }
    }
    updated() {
        this._setTemp = this._getSetTemp(this.hass.states[this.config.entity]);
        this.temp_overlay = this._getOverlayState(this.hass.states[this.config.overlay]);
    }
    _openSettings() {
        this.shadowRoot.getElementById('popup').classList.add('off');
        this.shadowRoot.getElementById('settings').classList.add('on');
    }
    _closeSettings() {
        this.shadowRoot.getElementById('settings').classList.remove('on');
        this.shadowRoot.getElementById('popup').classList.remove('off');
    }
    _thermostat_mousedown() {
        this.shadowRoot.getElementById('thermostat').classList.add('mousedown');
    }
    _thermostat_mouseup() {
        this.shadowRoot.getElementById('thermostat').classList.remove('mousedown');
    }
    _change_track(e) {
        this.shadowRoot.getElementById('track').style.height = ((100 / 21) * (e.srcElement.value - 4)).toString() + '%';
        const temp_string = e.srcElement.value.toString();
        const temp_string_deg = e.srcElement.value.toString() + '&#176;';
        if (e.srcElement.value - 4 > 0) {
            this.shadowRoot.getElementById('popup').className = this.shadowRoot
                .getElementById('popup')
                .className.replace(/temp.*/g, '');
            this.shadowRoot.getElementById('popup').classList.add('temp-' + temp_string);
            this.shadowRoot.getElementById('target_temp_track').innerHTML = temp_string_deg;
        }
        else {
            this.shadowRoot.getElementById('popup').className = this.shadowRoot
                .getElementById('popup')
                .className.replace(/temp.*/g, '');
            this.shadowRoot.getElementById('popup').classList.add('temp-off');
            this.shadowRoot.getElementById('target_temp_track').innerHTML = 'OFF';
        }
        // console.log(e.srcElement.value);
        this.temp_wanted = e.srcElement.value;
    }
    _getSetTemp(stateObj) {
        if (stateObj.state === 'unavailable') {
            return this.hass.localize('state.default.unavailable');
        }
        if (stateObj.attributes.target_temp_low && stateObj.attributes.target_temp_high) {
            return [stateObj.attributes.target_temp_low, stateObj.attributes.target_temp_high];
        }
        return stateObj.attributes.temperature;
    }
    _getOverlayState(stateObj) {
        const overlay = stateObj.state;
        if (overlay === 'unavailable') {
            return this.hass.localize('state.default.unavailable');
        }
        const isTrueSet = overlay === 'True';
        return isTrueSet;
    }
    _close(event) {
        if (event && event.target.classList.length > 0) {
            if (event.target.classList.contains('popup-inner') || event.target.classList.contains('settings-inner')) {
                closePopUp();
            }
        }
    }
    _setTemperature(temperature) {
        // console.log(temperature);
        this.hass.callService('climate', 'set_temperature', {
            entity_id: this.config.entity,
            temperature: temperature,
        });
    }
    _handleModeClick() {
        this.hass.callService('climate', 'set_hvac_mode', {
            entity_id: this.config.entity,
            hvac_mode: 'auto',
        });
    }
    // _compareClimateHvacModes = (mode1, mode2) => this.hvacModeOrdering[mode1] - this.hvacModeOrdering[mode2];
    setConfig(config) {
        if (!config.entity) {
            throw new Error('You need to define a climate entity');
        }
        if (!config.heating) {
            throw new Error('You need to define a heating entity');
        }
        if (!config.title) {
            throw new Error('You need to give this a title via title: <title>');
        }
        if (!config.overlay) {
            throw new Error('You need to give this a title via title: <title>');
        }
        this.config = config;
    }
    // getCardSize(): number {
    //   return 1;
    // }
    // Import Styling Externally
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    static get styles() {
        return [animation_styling, shared_styling, thermostat_styling, slider_styling];
    }
}
customElements.define('tado-popup-card', TadoPopupCard);

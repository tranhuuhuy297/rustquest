/* Realm 7 — Closures & Iterators. Appends one module to window.RUSTQUEST.modules. */
window.RUSTQUEST.modules.push({
  id: "closures-iterators",
  n: 7,
  title: "Closures & Iterators",
  subtitle: "Capture your environment and transform data with lazy, chainable pipelines.",
  color: "#876E86",
  icon: "compass",
  lessons: [
    {
      id: "closures",
      title: "Closures",
      tag: "Anonymous functions that capture their environment",
      min: 11,
      xp: 180,
      blocks: [
        {
          t: "text",
          html: "A <strong>closure</strong> is an anonymous function you can store in a variable or pass to another function. The syntax uses vertical bars for parameters: <code>|x| x + 1</code>. Unlike regular functions, closures can <em>capture</em> variables from the surrounding scope."
        },
        {
          t: "code",
          caption: "Closure syntax at a glance",
          code: "let add_one = |x: i32| -> i32 { x + 1 };\nlet double  = |x| x * 2;          // types inferred\nlet greet   = || println!(\"hi!\"); // no parameters\n\nprintln!(\"{}\", add_one(5));  // 6\nprintln!(\"{}\", double(7));   // 14"
        },
        {
          t: "text",
          html: "Closures capture the enclosing scope in three ways, mirroring Rust's ownership rules. The compiler picks the least restrictive: <strong>by reference</strong> (<code>Fn</code>), <strong>by mutable reference</strong> (<code>FnMut</code>), or <strong>by value / move</strong> (<code>FnOnce</code>). Use the <code>move</code> keyword to force ownership transfer."
        },
        {
          t: "callout",
          kind: "note",
          html: "<code>Fn</code>, <code>FnMut</code>, and <code>FnOnce</code> are traits. <code>FnOnce</code> can be called once (it consumes captured values). <code>FnMut</code> may mutate captured state. <code>Fn</code> only borrows immutably and can be called any number of times."
        },
        {
          t: "play",
          prompt: "Run the code to see a closure capturing a local variable by reference, then by move.",
          code: "fn apply(f: impl Fn(i32) -> i32, val: i32) -> i32 {\n    f(val)\n}\n\nfn main() {\n    let base = 10;\n    let add_base = |x| x + base;  // captures base by ref\n    println!(\"add_base(5) = {}\", apply(add_base, 5));\n\n    let greeting = String::from(\"Hello\");\n    let greet = move || println!(\"{}, Rustacean!\", greeting); // moves greeting\n    greet();\n}",
          output: "add_base(5) = 15\nHello, Rustacean!",
          need: ["impl Fn", "move"]
        },
        {
          t: "fib",
          prompt: "Complete the closure that multiplies its argument by three.",
          before: "let triple = |x| x ",
          blank: "*",
          after: " 3;",
          answer: "*",
          hint: "The arithmetic operator for multiplication."
        },
        {
          t: "callout",
          kind: "tip",
          html: "Use <code>impl Fn(T) -&gt; U</code> in function signatures to accept any closure (or function) that matches the shape. For stored closures on structs or trait objects use <code>Box&lt;dyn Fn(T) -&gt; U&gt;</code>."
        }
      ],
      quiz: [
        {
          q: "What does the `move` keyword do in a closure?",
          opts: [
            "Makes the closure mutable",
            "Forces the closure to take ownership of captured variables",
            "Allows the closure to be called multiple times",
            "Moves the closure to a new thread automatically"
          ],
          a: 1,
          why: "`move` transfers ownership of any captured variables into the closure, so it can outlive the original scope."
        },
        {
          q: "Which trait describes a closure that can only be called once because it consumes a captured value?",
          opts: ["Fn", "FnMut", "FnOnce", "FnMove"],
          a: 2,
          why: "`FnOnce` closures consume captured values when called and therefore can only be invoked once."
        },
        {
          q: "What is the closure syntax for a closure taking one argument `n` and returning `n + 1`?",
          opts: ["fn(n) { n + 1 }", "|n| n + 1", "(n) => n + 1", "closure(n) -> n + 1"],
          a: 1,
          why: "Rust closures use `|params| body`. The body can be a single expression without braces."
        }
      ],
      takeaways: [
        "Closures use `|params| body` syntax and capture the enclosing scope.",
        "`Fn` / `FnMut` / `FnOnce` reflect how captured variables are used.",
        "Use `move` to transfer ownership; use `impl Fn(T) -> U` to accept closures in functions."
      ]
    },
    {
      id: "iterators",
      title: "The Iterator Trait",
      tag: "Lazy sequences and next()",
      min: 12,
      xp: 190,
      blocks: [
        {
          t: "text",
          html: "An <strong>iterator</strong> is any type that implements the <code>Iterator</code> trait. That trait has one required method: <code>fn next(&amp;mut self) -> Option&lt;Self::Item&gt;</code>. Calling <code>next()</code> advances the sequence and returns <code>Some(value)</code> until it returns <code>None</code>."
        },
        {
          t: "code",
          caption: "The Iterator trait in miniature",
          code: "// From the standard library (simplified):\npub trait Iterator {\n    type Item;\n    fn next(&mut self) -> Option<Self::Item>;\n    // 70+ adapter methods built on top of next()...\n}"
        },
        {
          t: "text",
          html: "Collections expose iterators through three methods: <code>iter()</code> yields shared references (<code>&amp;T</code>), <code>iter_mut()</code> yields mutable references (<code>&amp;mut T</code>), and <code>into_iter()</code> consumes the collection, yielding owned values (<code>T</code>). Iterators are <em>lazy</em>: no work happens until you drive them with a consuming adapter or a <code>for</code> loop."
        },
        {
          t: "play",
          prompt: "Run the code to see how `next()` manually drives an iterator.",
          code: "fn main() {\n    let nums = vec![10, 20, 30];\n    let mut iter = nums.iter();\n    println!(\"{:?}\", iter.next()); // Some(10)\n    println!(\"{:?}\", iter.next()); // Some(20)\n    println!(\"{:?}\", iter.next()); // Some(30)\n    println!(\"{:?}\", iter.next()); // None\n}",
          output: "Some(10)\nSome(20)\nSome(30)\nNone",
          need: ["iter.next()"]
        },
        {
          t: "callout",
          kind: "tip",
          html: "A <code>for</code> loop is just syntactic sugar over <code>into_iter()</code> plus repeated <code>next()</code> calls. This means every type that implements <code>IntoIterator</code> works with <code>for</code> automatically."
        },
        {
          t: "fib",
          prompt: "Fill in the method that produces an iterator of shared references over a Vec.",
          before: "let v = vec![1, 2, 3];\nlet mut it = v.",
          blank: "iter",
          after: "();",
          answer: "iter",
          hint: "The method that borrows a collection and yields &T."
        },
        {
          t: "callout",
          kind: "warn",
          html: "Iterators are <strong>lazy</strong>. Writing <code>v.iter().map(|x| x * 2)</code> alone does <em>nothing</em> — no computation runs until a consuming method (<code>collect</code>, <code>sum</code>, <code>for</code>…) drives the chain."
        }
      ],
      quiz: [
        {
          q: "What does `iter.next()` return when the iterator is exhausted?",
          opts: ["0", "An empty Vec", "None", "It panics"],
          a: 2,
          why: "`next()` returns `Option<Item>`: `Some(value)` while items remain and `None` when the iterator is done."
        },
        {
          q: "Which method gives you owned values instead of references when iterating a Vec?",
          opts: ["iter()", "iter_mut()", "into_iter()", "iter_owned()"],
          a: 2,
          why: "`into_iter()` consumes the collection and yields owned `T` values."
        },
        {
          q: "Why are Rust iterators described as 'lazy'?",
          opts: [
            "They only work on small data",
            "No computation runs until a consuming adapter drives them",
            "They require async/await to work",
            "They are deprecated in newer Rust"
          ],
          a: 1,
          why: "Iterator adapters build a description of work but do nothing until something like `collect()` or `for` actually pulls values through."
        }
      ],
      takeaways: [
        "Implement `next() -> Option<Item>` to make any type an iterator.",
        "`iter()` borrows, `iter_mut()` borrows mutably, `into_iter()` consumes.",
        "Iterators are lazy: work only happens when a consumer drives the chain."
      ]
    },
    {
      id: "iterator-adapters",
      title: "Iterator Adapters",
      tag: "map, filter, collect, and friends",
      min: 12,
      xp: 200,
      blocks: [
        {
          t: "text",
          html: "Iterator <strong>adapters</strong> transform one iterator into another. They are lazy — each adapter wraps the previous without doing any work. Common adapters: <code>map</code> transforms each item, <code>filter</code> keeps items matching a predicate, <code>enumerate</code> pairs each item with its index, and <code>take</code> limits the count."
        },
        {
          t: "code",
          caption: "Building a pipeline",
          code: "let v = vec![1, 2, 3, 4, 5];\n\nlet evens_doubled: Vec<i32> = v.iter()\n    .filter(|&&x| x % 2 == 0)   // keep 2, 4\n    .map(|&x| x * 2)             // double: 4, 8\n    .collect();                  // drive the chain\n\nprintln!(\"{:?}\", evens_doubled); // [4, 8]"
        },
        {
          t: "text",
          html: "<strong>Consuming adapters</strong> drive the iterator to completion. <code>collect()</code> gathers items into a collection — you often need a <em>turbofish</em> <code>::&lt;Vec&lt;i32&gt;&gt;</code> or a type annotation so the compiler knows what to build. Other consumers: <code>sum()</code>, <code>count()</code>, <code>any()</code>, <code>all()</code>, <code>max()</code>, <code>min()</code>."
        },
        {
          t: "play",
          prompt: "Run to see map, filter, and collect in action on a Vec of integers.",
          code: "fn main() {\n    let numbers = vec![1, 2, 3, 4, 5, 6];\n\n    let squares: Vec<i32> = numbers.iter()\n        .map(|&x| x * x)\n        .collect();\n    println!(\"{:?}\", squares);\n\n    let count = numbers.iter().filter(|&&x| x % 2 == 0).count();\n    println!(\"even count: {}\", count);\n}",
          output: "[1, 4, 9, 16, 25, 36]\neven count: 3",
          need: [".map(", ".collect()", ".filter("]
        },
        {
          t: "callout",
          kind: "tip",
          html: "When calling <code>collect()</code> the compiler needs to know the target type. Supply it as a type annotation on the variable (<code>let v: Vec&lt;_&gt;</code>) or with turbofish: <code>.collect::&lt;Vec&lt;_&gt;&gt;()</code>. The <code>_</code> lets the compiler infer the element type."
        },
        {
          t: "fib",
          prompt: "Use the adapter that transforms each element of an iterator.",
          before: "let doubled: Vec<i32> = vec![1, 2, 3].iter().",
          blank: "map",
          after: "(|&x| x * 2).collect();",
          answer: "map",
          hint: "The adapter that applies a closure to every item."
        },
        {
          t: "play",
          prompt: "Run to see `enumerate` and `take` in action.",
          code: "fn main() {\n    let words = vec![\"alpha\", \"beta\", \"gamma\", \"delta\"];\n    for (i, word) in words.iter().enumerate().take(3) {\n        println!(\"{}: {}\", i, word);\n    }\n}",
          output: "0: alpha\n1: beta\n2: gamma",
          need: [".enumerate()", ".take("]
        }
      ],
      quiz: [
        {
          q: "What does `collect()` do?",
          opts: [
            "It filters duplicate items",
            "It drives a lazy iterator chain and gathers results into a collection",
            "It counts the number of items",
            "It sorts the iterator"
          ],
          a: 1,
          why: "`collect()` is a consuming adapter that pulls all values through the chain and places them into a target collection like `Vec<T>`."
        },
        {
          q: "Which adapter pairs each element with its zero-based position?",
          opts: ["index()", "zip()", "enumerate()", "position()"],
          a: 2,
          why: "`enumerate()` wraps items in `(usize, Item)` tuples starting from index 0."
        },
        {
          q: "What does `iter().filter(|&&x| x > 3).count()` return for `vec![1,2,3,4,5]`?",
          opts: ["2", "3", "4", "5"],
          a: 0,
          why: "Only 4 and 5 are greater than 3, so the count is 2."
        }
      ],
      takeaways: [
        "`map` transforms, `filter` selects, `take` limits — all lazy until consumed.",
        "`collect()` drives the chain into a `Vec`, `String`, or other collection.",
        "Annotate the target type or use turbofish `collect::<Vec<_>>()` to guide inference."
      ]
    },
    {
      id: "functional-patterns",
      title: "Functional Patterns",
      tag: "fold, zip, and chaining pipelines",
      min: 11,
      xp: 190,
      blocks: [
        {
          t: "text",
          html: "<code>fold</code> is the most general consuming adapter. It starts with an accumulator and applies a closure to each item: <code>iter.fold(init, |acc, item| ...)</code>. Many other adapters (<code>sum</code>, <code>count</code>, <code>any</code>) are implemented with <code>fold</code> under the hood."
        },
        {
          t: "code",
          caption: "fold: the universal reducer",
          code: "let numbers = vec![1, 2, 3, 4, 5];\n\nlet product = numbers.iter().fold(1, |acc, &x| acc * x);\nprintln!(\"product = {product}\"); // product = 120\n\nlet sentence = vec![\"Rust\", \"is\", \"fun\"];\nlet joined = sentence.iter().fold(String::new(), |mut acc, &w| {\n    if !acc.is_empty() { acc.push(' '); }\n    acc.push_str(w);\n    acc\n});\nprintln!(\"{joined}\"); // Rust is fun"
        },
        {
          t: "text",
          html: "<code>zip</code> combines two iterators element-by-element into an iterator of tuples. It stops when the shorter one is exhausted. <code>chain</code> appends one iterator after another. <code>rev</code> reverses a double-ended iterator."
        },
        {
          t: "play",
          prompt: "Run to see zip pairing two Vecs, and chain concatenating them.",
          code: "fn main() {\n    let names = vec![\"Ada\", \"Grace\", \"Alan\"];\n    let scores = vec![98, 95, 91];\n\n    let paired: Vec<_> = names.iter().zip(scores.iter()).collect();\n    for (name, score) in &paired {\n        println!(\"{}: {}\", name, score);\n    }\n\n    let a = vec![1, 2];\n    let b = vec![3, 4];\n    let chained: Vec<i32> = a.iter().chain(b.iter()).map(|&x| x).collect();\n    println!(\"{:?}\", chained);\n}",
          output: "Ada: 98\nGrace: 95\nAlan: 91\n[1, 2, 3, 4]",
          need: [".zip(", ".chain("]
        },
        {
          t: "text",
          html: "Long pipelines read like a data-transformation story. Each step is a single concern: filter noise, reshape values, accumulate results. Rust's zero-cost abstractions mean the compiler fuses these steps into efficient machine code — no intermediate allocations."
        },
        {
          t: "play",
          prompt: "Run this multi-step pipeline: keep positives, square them, sum the result.",
          code: "fn main() {\n    let data = vec![-3, 1, -1, 4, 2, -5, 3];\n\n    let result: i32 = data.iter()\n        .filter(|&&x| x > 0)\n        .map(|&x| x * x)\n        .sum();\n\n    println!(\"sum of squares of positives: {}\", result);\n}",
          output: "sum of squares of positives: 30",
          need: [".filter(", ".map(", ".sum()"]
        },
        {
          t: "fib",
          prompt: "Complete the consuming adapter that reduces an iterator to a single value using an accumulator.",
          before: "let total = vec![1, 2, 3, 4].iter().",
          blank: "fold",
          after: "(0, |acc, &x| acc + x);",
          answer: "fold",
          hint: "The adapter that generalises sum/product with a starting value and a closure."
        },
        {
          t: "callout",
          kind: "tip",
          html: "Prefer iterator pipelines over manual <code>for</code> loops when the logic is transformations and aggregations — they are more composable, often shorter, and just as fast thanks to Rust's <strong>zero-cost abstractions</strong>."
        }
      ],
      quiz: [
        {
          q: "What is `fold`'s first argument?",
          opts: ["A predicate closure", "The initial accumulator value", "The maximum number of iterations", "A comparison function"],
          a: 1,
          why: "`fold(init, |acc, item| ...)` — the first argument seeds the accumulator before any items are processed."
        },
        {
          q: "What does `zip` do when one iterator is shorter than the other?",
          opts: [
            "It pads the shorter one with default values",
            "It panics",
            "It stops producing pairs when the shorter iterator is exhausted",
            "It repeats the shorter iterator"
          ],
          a: 2,
          why: "`zip` is conservative: it stops as soon as either iterator returns `None`."
        },
        {
          q: "What does `vec![-2, 0, 3, 5].iter().filter(|&&x| x > 0).count()` return?",
          opts: ["1", "2", "3", "4"],
          a: 1,
          why: "Only 3 and 5 satisfy `x > 0`, so the count is 2."
        }
      ],
      takeaways: [
        "`fold(init, |acc, item| ...)` is the universal reducer — `sum`, `count`, and others are built on it.",
        "`zip` pairs two iterators; `chain` appends them; `rev` reverses a double-ended iterator.",
        "Chained pipelines are idiomatic and zero-cost: the compiler fuses them into efficient loops."
      ]
    }
  ]
});

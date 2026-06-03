/* Realm 5 — Traits & Generics. Appends one module to window.RUSTQUEST.modules. */
window.RUSTQUEST.modules.push({
  id: "traits-generics",
  n: 5,
  title: "Traits & Generics",
  subtitle: "Write code once, reuse it everywhere — safely.",
  color: "#B56C5A",
  icon: "shapes",
  lessons: [
    {
      id: "generics",
      title: "Generics",
      tag: "Abstract over types",
      min: 11,
      xp: 180,
      blocks: [
        {
          t: "text",
          html: "<strong>Generics</strong> let you write a function or struct once and reuse it with many different types. Instead of writing <code>fn largest_i32</code>, <code>fn largest_f64</code>, etc., you write <code>fn largest&lt;T&gt;</code> — the <code>T</code> is a <em>type parameter</em> that is filled in at compile time."
        },
        {
          t: "code",
          caption: "A generic function",
          code: "fn first<T>(list: &[T]) -> &T {\n    &list[0]\n}\n\nfn main() {\n    let nums = [10, 20, 30];\n    let words = [\"apple\", \"banana\"];\n    println!(\"{}\", first(&nums));   // 10\n    println!(\"{}\", first(&words));  // apple\n}"
        },
        {
          t: "text",
          html: "Structs can also be generic. Put the type parameter in angle brackets right after the struct name, then use it in the fields."
        },
        {
          t: "code",
          caption: "A generic struct",
          code: "struct Pair<T> {\n    first: T,\n    second: T,\n}\n\nfn main() {\n    let p = Pair { first: 1, second: 2 };\n    println!(\"{} {}\", p.first, p.second);\n}"
        },
        {
          t: "callout",
          kind: "tip",
          html: "Generics are <strong>zero-cost</strong>: the compiler performs <em>monomorphization</em> — it stamps out a concrete copy of the code for every type you actually use. You pay no runtime overhead."
        },
        {
          t: "play",
          prompt: "Run this generic function that wraps a value. Notice it works for both i32 and &str.",
          code: "fn wrap<T>(value: T) -> (T, &'static str) {\n    (value, \"wrapped\")\n}\n\nfn main() {\n    let (n, label) = wrap(42);\n    println!(\"{} {}\", n, label);\n    let (s, label2) = wrap(\"hello\");\n    println!(\"{} {}\", s, label2);\n}",
          output: "42 wrapped\nhello wrapped",
          need: ["wrap", "fn main()"]
        },
        {
          t: "fib",
          prompt: "Complete the type parameter syntax for a generic function.",
          before: "fn identity",
          blank: "<T>",
          after: "(x: T) -> T { x }",
          answer: "<T>",
          hint: "Type parameters go in angle brackets right after the function name."
        }
      ],
      quiz: [
        {
          q: "What is monomorphization?",
          opts: [
            "A runtime feature that slows down generics",
            "The compiler generating concrete type-specific code from generic code",
            "A trait for converting types",
            "A way to restrict type parameters"
          ],
          a: 1,
          why: "Monomorphization means the compiler creates a dedicated copy of the generic code for each concrete type used, resulting in zero runtime overhead."
        },
        {
          q: "Where do type parameters appear in a generic function definition?",
          opts: [
            "After the return type",
            "Inside the function body",
            "In angle brackets after the function name",
            "Before the `fn` keyword"
          ],
          a: 2,
          why: "`fn name<T>(...)` — type parameters go in `<>` right after the function name."
        },
        {
          q: "Can a generic struct hold two fields of different types using one type parameter?",
          opts: [
            "Yes, T can represent any combination",
            "No — one type parameter means both fields share the same type",
            "Only if the fields implement Display",
            "Only in nightly Rust"
          ],
          a: 1,
          why: "`struct Pair<T> { first: T, second: T }` — both fields must be the same T. Use two parameters `<T, U>` for different types."
        }
      ],
      takeaways: [
        "Type parameters like `<T>` let one function or struct work for many types.",
        "Monomorphization makes generics zero-cost at runtime.",
        "Generic structs put `<T>` after the struct name, then use `T` in fields."
      ]
    },
    {
      id: "traits",
      title: "Traits",
      tag: "Shared behavior as contracts",
      min: 12,
      xp: 190,
      blocks: [
        {
          t: "text",
          html: "A <strong>trait</strong> defines shared behavior — it's like an interface or a contract. You declare which methods a type must provide, and then <em>implement</em> the trait for as many types as you like."
        },
        {
          t: "code",
          caption: "Defining and implementing a trait",
          code: "trait Greet {\n    fn hello(&self) -> String;\n}\n\nstruct Human;\nstruct Robot;\n\nimpl Greet for Human {\n    fn hello(&self) -> String {\n        String::from(\"Hi, I'm a human!\")\n    }\n}\n\nimpl Greet for Robot {\n    fn hello(&self) -> String {\n        String::from(\"BEEP BOOP.\")\n    }\n}"
        },
        {
          t: "text",
          html: "Traits can include <strong>default method implementations</strong>. Implementing types get the default for free but can override it."
        },
        {
          t: "code",
          caption: "Default method",
          code: "trait Describe {\n    fn name(&self) -> &str;\n    fn describe(&self) -> String {\n        format!(\"I am {}\", self.name())\n    }\n}"
        },
        {
          t: "callout",
          kind: "note",
          html: "Use <code>T: Trait</code> syntax (a <em>trait bound</em>) to require that a generic type parameter implements a specific trait. This lets you call the trait's methods on <code>T</code> inside the function."
        },
        {
          t: "play",
          prompt: "Run to see a trait with a default method. Both types share the same `describe` but provide their own `name`.",
          code: "trait Describe {\n    fn name(&self) -> &str;\n    fn describe(&self) -> String {\n        format!(\"I am {}\", self.name())\n    }\n}\n\nstruct Cat;\nstruct Dog;\n\nimpl Describe for Cat {\n    fn name(&self) -> &str { \"Cat\" }\n}\n\nimpl Describe for Dog {\n    fn name(&self) -> &str { \"Dog\" }\n}\n\nfn print_desc<T: Describe>(animal: &T) {\n    println!(\"{}\", animal.describe());\n}\n\nfn main() {\n    print_desc(&Cat);\n    print_desc(&Dog);\n}",
          output: "I am Cat\nI am Dog",
          need: ["trait Describe", "fn main()"]
        },
        {
          t: "fib",
          prompt: "Add a trait bound so this function only accepts types that implement `Describe`.",
          before: "fn show<T: ",
          blank: "Describe",
          after: ">(item: &T) { println!(\"{}\", item.describe()); }",
          answer: "Describe",
          hint: "The trait name goes right after the colon in the type parameter bound."
        }
      ],
      quiz: [
        {
          q: "What is a trait in Rust?",
          opts: [
            "A way to allocate memory on the heap",
            "A definition of shared behavior that types can implement",
            "A type alias",
            "A closure wrapper"
          ],
          a: 1,
          why: "Traits define a contract — a set of methods a type must provide — enabling polymorphism."
        },
        {
          q: "What is a default method in a trait?",
          opts: [
            "A method that cannot be overridden",
            "A method with an implementation provided in the trait itself",
            "A method that only works on primitive types",
            "A method automatically called at program start"
          ],
          a: 1,
          why: "Traits can supply method bodies; implementing types get them for free and can override if needed."
        },
        {
          q: "What does `T: Display` mean in a function signature?",
          opts: [
            "T must be a Display struct",
            "T is the return type",
            "T must implement the Display trait",
            "T is generic only for Display"
          ],
          a: 2,
          why: "`T: Display` is a trait bound — it constrains T to types that implement the Display trait."
        }
      ],
      takeaways: [
        "Traits define shared behavior; `impl Trait for Type` wires it up.",
        "Default methods in traits reduce boilerplate for implementors.",
        "Trait bounds (`T: Trait`) restrict generics to types with required behavior."
      ]
    },
    {
      id: "trait-objects",
      title: "Trait Objects",
      tag: "Dynamic dispatch with dyn",
      min: 11,
      xp: 190,
      blocks: [
        {
          t: "text",
          html: "Generic functions with trait bounds use <strong>static dispatch</strong> — the compiler knows the exact type at compile time. But sometimes you need to store <em>different</em> types that share a trait in one collection. That's where <strong>trait objects</strong> come in."
        },
        {
          t: "text",
          html: "Write <code>&amp;dyn Trait</code> or <code>Box&lt;dyn Trait&gt;</code> to hold <em>any</em> value that implements the trait. The <code>dyn</code> keyword signals <strong>dynamic dispatch</strong> — the correct method is looked up at runtime via a vtable."
        },
        {
          t: "code",
          caption: "Trait objects for a mixed collection",
          code: "trait Shape {\n    fn area(&self) -> f64;\n}\n\nstruct Circle { radius: f64 }\nstruct Square { side: f64 }\n\nimpl Shape for Circle {\n    fn area(&self) -> f64 { 3.14 * self.radius * self.radius }\n}\n\nimpl Shape for Square {\n    fn area(&self) -> f64 { self.side * self.side }\n}\n\nfn main() {\n    let shapes: Vec<Box<dyn Shape>> = vec![\n        Box::new(Circle { radius: 1.0 }),\n        Box::new(Square { side: 2.0 }),\n    ];\n    for s in &shapes {\n        println!(\"{:.2}\", s.area());\n    }\n}"
        },
        {
          t: "callout",
          kind: "warn",
          html: "Dynamic dispatch has a small runtime cost (an indirect function call through a pointer). Prefer static dispatch (generics) when performance is critical and the types are known at compile time."
        },
        {
          t: "play",
          prompt: "Run this to see dynamic dispatch in action — two types behind one `&dyn` reference.",
          code: "trait Speak {\n    fn speak(&self) -> &str;\n}\n\nstruct Cat;\nstruct Dog;\n\nimpl Speak for Cat {\n    fn speak(&self) -> &str { \"meow\" }\n}\n\nimpl Speak for Dog {\n    fn speak(&self) -> &str { \"woof\" }\n}\n\nfn make_sound(animal: &dyn Speak) {\n    println!(\"{}\", animal.speak());\n}\n\nfn main() {\n    make_sound(&Cat);\n    make_sound(&Dog);\n}",
          output: "meow\nwoof",
          need: ["dyn Speak", "fn main()"]
        },
        {
          t: "fib",
          prompt: "Fill in the trait object type so the vector can hold any Shape.",
          before: "let shapes: Vec<Box<",
          blank: "dyn Shape",
          after: ">> = Vec::new();",
          answer: "dyn Shape",
          hint: "The `dyn` keyword precedes the trait name for dynamic dispatch."
        }
      ],
      quiz: [
        {
          q: "What does `dyn Trait` enable?",
          opts: [
            "Zero-cost generics",
            "Dynamic dispatch — calling trait methods on different types at runtime",
            "Compile-time monomorphization",
            "Trait bounds on closures"
          ],
          a: 1,
          why: "`dyn Trait` creates a trait object, enabling dynamic dispatch via a vtable at runtime."
        },
        {
          q: "Why use `Box<dyn Trait>` instead of just `dyn Trait`?",
          opts: [
            "Box is required for all traits",
            "Because trait objects have unknown size at compile time; Box gives them a fixed pointer size",
            "Box makes dispatch faster",
            "dyn alone is not valid Rust syntax"
          ],
          a: 1,
          why: "Trait objects are dynamically sized (DSTs). Putting them in a Box gives a known, fixed pointer size the compiler can use."
        },
        {
          q: "When should you prefer generics with trait bounds over trait objects?",
          opts: [
            "When you need a heterogeneous collection",
            "When you want runtime flexibility",
            "When the types are known at compile time and you want zero-cost abstraction",
            "When using async Rust"
          ],
          a: 2,
          why: "Static dispatch (generics) is monomorphized at compile time — no vtable overhead — making it the better choice when types are known."
        }
      ],
      takeaways: [
        "`&dyn Trait` and `Box<dyn Trait>` allow heterogeneous collections at the cost of dynamic dispatch.",
        "Dynamic dispatch resolves method calls at runtime via a vtable.",
        "Prefer static dispatch (generics) for performance; use trait objects for flexibility."
      ]
    },
    {
      id: "lifetimes",
      title: "Lifetimes",
      tag: "Teaching the compiler how long refs live",
      min: 13,
      xp: 200,
      blocks: [
        {
          t: "text",
          html: "<strong>Lifetimes</strong> are Rust's way of ensuring that references never outlive the data they point to. Most of the time the compiler infers them automatically, but when a function returns a reference, you may need to annotate explicitly so the borrow checker knows which input the output borrows from."
        },
        {
          t: "text",
          html: "Lifetime annotations use a tick prefix: <code>&amp;'a str</code>. The name <code>'a</code> is just a label — it says &quot;this reference lives at least as long as the scope named <code>'a</code>.&quot;"
        },
        {
          t: "code",
          caption: "A function that needs a lifetime annotation",
          code: "// Without annotations the compiler can't know which arg the return borrows from.\nfn longest<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() >= y.len() { x } else { y }\n}\n\nfn main() {\n    let s1 = String::from(\"long string\");\n    let result;\n    {\n        let s2 = String::from(\"xyz\");\n        result = longest(s1.as_str(), s2.as_str());\n        println!(\"{result}\");\n    }\n}"
        },
        {
          t: "callout",
          kind: "note",
          html: "The annotation <code>'a</code> doesn't change how long data lives — it's purely informational for the compiler. It says: <em>the return value lives at most as long as the shorter of the two inputs</em>."
        },
        {
          t: "callout",
          kind: "tip",
          html: "<code>&amp;'static</code> is a special lifetime meaning the reference is valid for the <em>entire program</em>. String literals like <code>&quot;hello&quot;</code> have type <code>&amp;'static str</code> because they are baked into the binary."
        },
        {
          t: "play",
          prompt: "Run this function that returns the shorter of two string slices. The lifetime `'a` ties the output to the inputs.",
          code: "fn shorter<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() <= y.len() { x } else { y }\n}\n\nfn main() {\n    let a = \"hello\";\n    let b = \"hi\";\n    println!(\"{}\", shorter(a, b));\n}",
          output: "hi",
          need: ["shorter", "fn main()"]
        },
        {
          t: "fib",
          prompt: "Add the lifetime parameter so the function signature is valid.",
          before: "fn first_word<",
          blank: "'a",
          after: ">(s: &'a str) -> &'a str { s.split_whitespace().next().unwrap_or(\"\") }",
          answer: "'a",
          hint: "Lifetime names start with a tick character, like 'a."
        }
      ],
      quiz: [
        {
          q: "What problem do lifetime annotations solve?",
          opts: [
            "They speed up the borrow checker",
            "They tell the compiler how long a reference is valid relative to other references",
            "They make all references immutable",
            "They enable garbage collection"
          ],
          a: 1,
          why: "Lifetime annotations let the borrow checker verify that returned references cannot outlive their source data."
        },
        {
          q: "What does `&'static str` mean?",
          opts: [
            "A mutable string that lives forever",
            "A reference valid for the entire program duration",
            "A string allocated on the heap",
            "A reference that cannot be shared"
          ],
          a: 1,
          why: "`'static` means the referenced data lives for the entire program — string literals are the most common example."
        },
        {
          q: "Does adding a lifetime annotation change how long data actually lives?",
          opts: [
            "Yes, it extends the data's lifetime",
            "Yes, it shortens it",
            "No, it only informs the compiler about existing relationships",
            "Only if the function is called recursively"
          ],
          a: 2,
          why: "Lifetime annotations are descriptive, not prescriptive — they tell the compiler about lifetimes that already exist, without changing them."
        }
      ],
      takeaways: [
        "Lifetime annotations (`'a`) tell the compiler which input a returned reference borrows from.",
        "`&'static` means valid for the entire program; string literals have this lifetime.",
        "Annotations are informational only — they describe, not extend, how long data lives."
      ]
    }
  ]
});

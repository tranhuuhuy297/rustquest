/* Realm 8 — Smart Pointers. Appends one module to window.RUSTQUEST.modules. */
window.RUSTQUEST.modules.push({
  id: "smart-pointers",
  n: 8,
  title: "Smart Pointers",
  subtitle: "Box, Rc, and RefCell — owning the heap and bending the borrow rules safely.",
  color: "#6F6E96",
  icon: "shield",
  lessons: [
    {
      id: "box",
      title: "Box<T>",
      tag: "Heap allocation and recursive types",
      min: 11,
      xp: 200,
      blocks: [
        {
          t: "text",
          html: "<code>Box&lt;T&gt;</code> is the simplest smart pointer: it allocates a value on the <strong>heap</strong> and gives you an owning pointer to it. When the <code>Box</code> goes out of scope the heap memory is freed automatically. Most values live on the stack by default; <code>Box</code> is how you explicitly opt into heap allocation."
        },
        {
          t: "text",
          html: "Three classic reasons to reach for <code>Box</code>: (1) you have a <strong>recursive type</strong> whose size can't be known at compile time, (2) you have a large value and want to move ownership cheaply without copying all the bytes, or (3) you need a <strong>trait object</strong> (<code>Box&lt;dyn Trait&gt;</code>)."
        },
        {
          t: "code",
          caption: "Recursive type — without Box the compiler can't compute the size",
          code: "enum List {\n    Cons(i32, Box<List>),\n    Nil,\n}\n\nuse List::{Cons, Nil};\n\nfn main() {\n    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));\n}"
        },
        {
          t: "callout",
          kind: "note",
          html: "Without the <code>Box</code>, <code>enum List</code> would be infinitely sized — each variant would have to contain a full <code>List</code> again. Wrapping with <code>Box&lt;List&gt;</code> breaks the cycle: the enum stores a fixed-size pointer to the heap instead."
        },
        {
          t: "play",
          prompt: "Run to see that dereferencing a Box works just like dereferencing a regular reference.",
          code: "fn main() {\n    let x = 5;\n    let y = Box::new(x);\n    println!(\"x = {x}\");\n    println!(\"y = {}\", *y);\n    println!(\"equal: {}\", x == *y);\n}",
          output: "x = 5\ny = 5\nequal: true",
          need: ["Box::new", "*y"]
        },
        {
          t: "callout",
          kind: "tip",
          html: "The <code>*</code> operator <em>dereferences</em> the <code>Box</code>, giving you the value inside. <code>Box&lt;T&gt;</code> implements the <code>Deref</code> trait, which is what makes <code>*y</code> work."
        },
        {
          t: "fib",
          prompt: "Complete the line so `b` holds the integer 42 on the heap.",
          before: "let b = Box::",
          blank: "new",
          after: "(42);",
          answer: "new",
          hint: "The associated function that creates a Box around a value."
        }
      ],
      quiz: [
        {
          q: "Why must a recursive enum use Box for the recursive variant?",
          opts: [
            "Box is required for all enum fields",
            "The compiler can't compute the size of an infinitely nested type without a pointer",
            "Box adds runtime type checking",
            "Recursive enums are not allowed in Rust"
          ],
          a: 1,
          why: "The enum's size would be infinite without indirection. Box stores a fixed-size heap pointer, making the size computable."
        },
        {
          q: "When a Box<T> goes out of scope, what happens to the heap value?",
          opts: [
            "It leaks until the program ends",
            "It is moved to the stack",
            "It is freed automatically via Drop",
            "You must call Box::free() manually"
          ],
          a: 2,
          why: "Box<T> implements Drop, which frees the heap allocation when the owner goes out of scope."
        },
        {
          q: "Which operator lets you access the value inside a Box?",
          opts: ["&", "*", "->", "@"],
          a: 1,
          why: "The dereference operator `*` follows the Box pointer to the heap value."
        }
      ],
      takeaways: [
        "`Box<T>` puts a value on the heap and frees it when dropped.",
        "Use `Box` to break size-cycle in recursive types and for trait objects.",
        "Dereference with `*` — Box implements Deref."
      ]
    },
    {
      id: "rc",
      title: "Rc<T>",
      tag: "Shared ownership by reference counting",
      min: 11,
      xp: 200,
      blocks: [
        {
          t: "text",
          html: "<code>Rc&lt;T&gt;</code> (reference-counted) lets multiple parts of your program <strong>share ownership</strong> of the same heap value. It keeps a count of how many <code>Rc</code> handles point to the data. The value is dropped only when the count reaches zero."
        },
        {
          t: "text",
          html: "Use <code>Rc::clone(&amp;a)</code> to create a new handle — this increments the count cheaply (no deep copy). Use <code>Rc::strong_count(&amp;a)</code> to inspect the count. <strong>Important:</strong> <code>Rc</code> is single-threaded only; for multi-threaded shared ownership, use <code>Arc</code>."
        },
        {
          t: "code",
          caption: "Multiple owners of the same list node",
          code: "use std::rc::Rc;\n\nenum List {\n    Cons(i32, Rc<List>),\n    Nil,\n}\n\nuse List::{Cons, Nil};\n\nfn main() {\n    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));\n    let b = Cons(3, Rc::clone(&a));\n    let c = Cons(4, Rc::clone(&a));\n    // a, b, and c all share the tail list\n}"
        },
        {
          t: "play",
          prompt: "Run and observe how strong_count changes as clones are created and dropped.",
          code: "use std::rc::Rc;\n\nfn main() {\n    let a = Rc::new(10);\n    println!(\"count after creating a = {}\", Rc::strong_count(&a));\n    {\n        let b = Rc::clone(&a);\n        println!(\"count after creating b = {}\", Rc::strong_count(&a));\n        let c = Rc::clone(&a);\n        println!(\"count after creating c = {}\", Rc::strong_count(&a));\n    } // b and c drop here\n    println!(\"count after b and c drop = {}\", Rc::strong_count(&a));\n}",
          output: "count after creating a = 1\ncount after creating b = 2\ncount after creating c = 3\ncount after b and c drop = 1",
          need: ["Rc::new", "Rc::clone", "Rc::strong_count"]
        },
        {
          t: "callout",
          kind: "warn",
          html: "<code>Rc&lt;T&gt;</code> only gives you <strong>immutable</strong> shared references. If you need to mutate through shared ownership, combine it with <code>RefCell&lt;T&gt;</code> — covered in the next lesson."
        },
        {
          t: "fib",
          prompt: "Clone an existing Rc handle so `b` shares ownership with `a`.",
          before: "let b = Rc::",
          blank: "clone",
          after: "(&a);",
          answer: "clone",
          hint: "The Rc function that creates a new handle and increments the count."
        }
      ],
      quiz: [
        {
          q: "What does Rc::clone do?",
          opts: [
            "Performs a deep copy of the heap data",
            "Creates a new Rc handle and increments the reference count",
            "Moves the value to a new location",
            "Creates a mutable reference"
          ],
          a: 1,
          why: "Rc::clone only increments the reference count — it does NOT copy the underlying data."
        },
        {
          q: "When is the value inside an Rc<T> dropped?",
          opts: [
            "When the first Rc handle goes out of scope",
            "When Rc::drop() is called explicitly",
            "When the reference count reaches zero",
            "At the end of the program"
          ],
          a: 2,
          why: "Rc tracks how many handles exist; the value is freed only once all handles are gone (count = 0)."
        }
      ],
      takeaways: [
        "`Rc<T>` enables multiple owners of one heap value via reference counting.",
        "`Rc::clone` increments the count; the value drops when count reaches 0.",
        "`Rc` is single-threaded only — use `Arc` for shared ownership across threads."
      ]
    },
    {
      id: "refcell",
      title: "RefCell & interior mutability",
      tag: "Mutate through a shared reference",
      min: 12,
      xp: 210,
      blocks: [
        {
          t: "text",
          html: "<strong>Interior mutability</strong> lets you mutate data even when you only hold an immutable reference to it. <code>RefCell&lt;T&gt;</code> is the standard tool for this. Instead of enforcing borrow rules at compile time, it enforces them at <strong>runtime</strong>, panicking if a violation occurs."
        },
        {
          t: "text",
          html: "Call <code>.borrow()</code> to get an immutable <code>Ref&lt;T&gt;</code>, or <code>.borrow_mut()</code> to get a mutable <code>RefMut&lt;T&gt;</code>. The rules are the same as normal references — any number of immutable borrows OR exactly one mutable borrow — but checked at runtime."
        },
        {
          t: "code",
          caption: "RefCell basics",
          code: "use std::cell::RefCell;\n\nfn main() {\n    let data = RefCell::new(vec![1, 2, 3]);\n\n    // Immutable borrow to read\n    println!(\"len = {}\", data.borrow().len());\n\n    // Mutable borrow to modify\n    data.borrow_mut().push(4);\n\n    println!(\"after push: {:?}\", data.borrow());\n}"
        },
        {
          t: "callout",
          kind: "warn",
          html: "Calling <code>borrow_mut()</code> while an active <code>borrow()</code> exists will <strong>panic at runtime</strong>. The borrow checker can't save you here — it's your responsibility to avoid overlapping borrows."
        },
        {
          t: "play",
          prompt: "Run to see the classic Rc<RefCell<T>> combo: shared AND mutable.",
          code: "use std::rc::Rc;\nuse std::cell::RefCell;\n\nfn main() {\n    let shared = Rc::new(RefCell::new(0));\n\n    let a = Rc::clone(&shared);\n    let b = Rc::clone(&shared);\n\n    *a.borrow_mut() += 10;\n    *b.borrow_mut() += 5;\n\n    println!(\"shared value = {}\", shared.borrow());\n}",
          output: "shared value = 15",
          need: ["Rc::new", "RefCell::new", "borrow_mut", "borrow"]
        },
        {
          t: "callout",
          kind: "tip",
          html: "<code>Rc&lt;RefCell&lt;T&gt;&gt;</code> is the idiomatic pattern for shared mutable state in single-threaded Rust. <code>Rc</code> provides multiple owners; <code>RefCell</code> provides mutability through any of those owners."
        },
        {
          t: "fib",
          prompt: "Borrow the RefCell mutably so you can modify the value inside.",
          before: "let mut val = cell.",
          blank: "borrow_mut",
          after: "();",
          answer: "borrow_mut",
          hint: "The RefCell method that grants a mutable borrow (panics if already borrowed)."
        }
      ],
      quiz: [
        {
          q: "When does RefCell enforce borrow rules?",
          opts: [
            "At compile time like normal references",
            "Only in debug builds",
            "At runtime, panicking on violation",
            "Never — it skips all checks"
          ],
          a: 2,
          why: "RefCell shifts borrow checking to runtime. A rule violation causes a panic instead of a compile error."
        },
        {
          q: "What does the Rc<RefCell<T>> combination give you?",
          opts: [
            "Thread-safe shared mutable state",
            "Single-threaded shared mutable state",
            "Immutable shared state",
            "Stack-allocated shared state"
          ],
          a: 1,
          why: "Rc enables multiple owners; RefCell enables mutation through any owner. Together they allow shared mutable state, but only in a single thread."
        },
        {
          q: "What happens if you call borrow_mut() while a borrow() is still active?",
          opts: [
            "The compiler rejects the code",
            "The program panics at runtime",
            "The second borrow waits until the first ends",
            "Nothing — RefCell allows it"
          ],
          a: 1,
          why: "RefCell panics at runtime when borrow rules are violated, just like the compile-time rules say: no mutable borrow while any immutable borrow is live."
        }
      ],
      takeaways: [
        "`RefCell<T>` enforces borrow rules at runtime instead of compile time.",
        "Use `.borrow()` and `.borrow_mut()` — violations panic, not fail to compile.",
        "`Rc<RefCell<T>>` is the standard pattern for shared mutable state in single-threaded code."
      ]
    },
    {
      id: "deref-drop",
      title: "Deref & Drop",
      tag: "Behave like a reference, clean up like an owner",
      min: 10,
      xp: 200,
      blocks: [
        {
          t: "text",
          html: "The <strong>Deref</strong> trait lets you customise what <code>*</code> does on your type. Smart pointers like <code>Box</code>, <code>Rc</code>, and <code>RefCell</code> all implement it. You can implement it for your own types too, making them behave like references."
        },
        {
          t: "code",
          caption: "A minimal Box-like wrapper that implements Deref",
          code: "use std::ops::Deref;\n\nstruct MyBox<T>(T);\n\nimpl<T> MyBox<T> {\n    fn new(x: T) -> MyBox<T> {\n        MyBox(x)\n    }\n}\n\nimpl<T> Deref for MyBox<T> {\n    type Target = T;\n    fn deref(&self) -> &T {\n        &self.0\n    }\n}\n\nfn main() {\n    let x = 5;\n    let y = MyBox::new(x);\n    println!(\"equal: {}\", x == *y); // *y calls deref()\n}"
        },
        {
          t: "callout",
          kind: "note",
          html: "<strong>Deref coercion</strong> is a convenience the compiler applies automatically: if a function expects <code>&amp;str</code> and you pass <code>&amp;String</code>, the compiler calls <code>deref()</code> for you, following a chain until the types match. This is why <code>&amp;Box&lt;String&gt;</code> can be passed where <code>&amp;str</code> is expected."
        },
        {
          t: "text",
          html: "The <strong>Drop</strong> trait lets you run custom cleanup code when a value goes out of scope. Implement <code>fn drop(&amp;mut self)</code> and Rust calls it automatically. Drops happen in reverse order of creation (LIFO). You can trigger early cleanup with <code>std::mem::drop(value)</code>."
        },
        {
          t: "play",
          prompt: "Run to see that Drop is called automatically and in reverse creation order.",
          code: "struct Noisy {\n    name: &'static str,\n}\n\nimpl Drop for Noisy {\n    fn drop(&mut self) {\n        println!(\"dropping {}\", self.name);\n    }\n}\n\nfn main() {\n    let _a = Noisy { name: \"a\" };\n    let _b = Noisy { name: \"b\" };\n    let _c = Noisy { name: \"c\" };\n    println!(\"end of main\");\n}",
          output: "end of main\ndropping c\ndropping b\ndropping a",
          need: ["impl Drop for", "fn drop"]
        },
        {
          t: "callout",
          kind: "tip",
          html: "You cannot call <code>value.drop()</code> directly — the compiler forbids it to prevent double-frees. Use <code>std::mem::drop(value)</code> if you need to free something before the scope ends."
        },
        {
          t: "fib",
          prompt: "Implement the Deref trait's required method that returns a reference to the inner value.",
          before: "fn deref(&self) -> &T {\n        &self.",
          blank: "0",
          after: "\n    }",
          answer: "0",
          hint: "Tuple structs access their fields by numeric index."
        }
      ],
      quiz: [
        {
          q: "What does implementing Deref for a type allow?",
          opts: [
            "The type can be freed manually",
            "The `*` operator can be used to access the inner value",
            "The type gains Send and Sync automatically",
            "The type can be cloned for free"
          ],
          a: 1,
          why: "Deref customises `*` (dereference). The compiler also uses it for deref coercions, reducing explicit conversions."
        },
        {
          q: "In what order are local variables dropped at the end of a scope?",
          opts: [
            "Alphabetical by name",
            "Same order as declared",
            "Reverse order of declaration (LIFO)",
            "Random order"
          ],
          a: 2,
          why: "Rust drops locals in reverse declaration order — the last created is the first destroyed, like a stack."
        }
      ],
      takeaways: [
        "Implement `Deref` to make `*` work on your type and to enable deref coercions.",
        "`Drop` runs automatically when a value goes out of scope — locals drop in reverse (LIFO) order.",
        "Use `std::mem::drop()` for early cleanup; direct `.drop()` calls are forbidden."
      ]
    }
  ]
});

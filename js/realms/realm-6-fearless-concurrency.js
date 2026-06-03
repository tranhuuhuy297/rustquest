/* Realm 6 — Fearless Concurrency. Appends one module to window.RUSTQUEST.modules. */
window.RUSTQUEST.modules.push({
  id: "concurrency",
  n: 6,
  title: "Fearless Concurrency",
  subtitle: "Threads, channels, and shared state — without data races.",
  color: "#9E6B6B",
  icon: "bolt",
  lessons: [
    {
      id: "threads",
      title: "Spawning Threads",
      tag: "Run code in parallel",
      min: 11,
      xp: 200,
      blocks: [
        {
          t: "text",
          html: "Rust lets you spawn OS threads with <code>std::thread::spawn</code>. Each thread runs a closure concurrently with the rest of your program. The function returns a <code>JoinHandle&lt;T&gt;</code> — a receipt you can use to wait for the thread to finish.",
        },
        {
          t: "code",
          caption: "Spawning and joining a thread",
          code: "use std::thread;\n\nfn main() {\n    let handle = thread::spawn(|| {\n        println!(\"Hello from a thread!\");\n    });\n    handle.join().unwrap();\n}",
        },
        {
          t: "callout",
          kind: "tip",
          html: "Always call <code>.join()</code> on a handle if you care about the thread's result or need to wait for its side effects. If you drop a handle without joining, the thread might be cancelled before it finishes.",
        },
        {
          t: "text",
          html: "When a closure captures variables from its environment, Rust requires a <strong><code>move</code></strong> closure for threads. This transfers ownership of captured values into the new thread, satisfying the borrow checker — the spawned thread might outlive the stack frame that created it.",
        },
        {
          t: "play",
          prompt: "Run to see three threads each compute a square, then print the sum after all have joined.",
          code: "use std::thread;\n\nfn main() {\n    let nums = vec![2, 3, 4];\n    let mut handles = vec![];\n    for n in nums {\n        let h = thread::spawn(move || n * n);\n        handles.push(h);\n    }\n    let sum: i32 = handles.into_iter().map(|h| h.join().unwrap()).sum();\n    println!(\"sum of squares = {sum}\");\n}",
          output: "sum of squares = 29",
          need: ["thread::spawn", "move", "join"],
        },
        {
          t: "fib",
          prompt: "Complete the closure keyword that transfers ownership into the spawned thread.",
          before: "let handle = thread::spawn(",
          blank: "move",
          after: "|| { /* use captured var */ });",
          answer: "move",
          hint: "This keyword before `||` transfers ownership of captured variables into the closure.",
        },
        {
          t: "callout",
          kind: "note",
          html: "Rust's type system <em>prevents data races at compile time</em>. If you try to share a plain <code>&amp;mut T</code> across threads, the compiler rejects it. The fearlessness comes from those rules.",
        },
      ],
      quiz: [
        {
          q: "What does `thread::spawn` return?",
          opts: ["A raw thread pointer", "A `JoinHandle<T>`", "A `Result<Thread>`", "Nothing — it's fire-and-forget"],
          a: 1,
          why: "`thread::spawn` returns a `JoinHandle<T>` that you can call `.join()` on to wait for the thread and retrieve its return value.",
        },
        {
          q: "Why do thread closures usually need the `move` keyword?",
          opts: [
            "To make the closure run faster",
            "To give the closure a mutable reference to captured data",
            "Because the spawned thread may outlive the scope that created it, requiring ownership",
            "It is only needed on Windows",
          ],
          a: 2,
          why: "The thread could outlive the stack frame. `move` transfers ownership of captured variables into the closure so the thread owns them safely.",
        },
        {
          q: "What happens if you drop a `JoinHandle` without calling `.join()`?",
          opts: [
            "The program panics immediately",
            "The thread is killed instantly",
            "The thread is detached and may not finish before the program exits",
            "Rust refuses to compile",
          ],
          a: 2,
          why: "Dropping a handle detaches the thread. If `main` exits first, the thread may be terminated before completing.",
        },
      ],
      takeaways: [
        "`thread::spawn(move || { ... })` runs code in a new OS thread.",
        "Call `.join().unwrap()` on the `JoinHandle` to wait and get the result.",
        "The `move` keyword transfers ownership of captured variables into the thread closure.",
      ],
    },
    {
      id: "channels",
      title: "Message Passing",
      tag: "Channels between threads",
      min: 12,
      xp: 210,
      blocks: [
        {
          t: "text",
          html: "Rust's standard library provides <strong>multi-producer, single-consumer (mpsc) channels</strong> via <code>std::sync::mpsc::channel()</code>. The call returns a <code>(Sender&lt;T&gt;, Receiver&lt;T&gt;)</code> pair. Move the sender into a thread, keep the receiver on the main thread.",
        },
        {
          t: "code",
          caption: "Creating and splitting a channel",
          code: "use std::sync::mpsc;\n\nlet (tx, rx) = mpsc::channel::<String>();",
        },
        {
          t: "text",
          html: "The <strong>sender</strong> (<code>tx</code>) calls <code>tx.send(value)</code>. The <strong>receiver</strong> (<code>rx</code>) blocks on <code>rx.recv()</code> until a message arrives. Both return <code>Result</code> so you can handle channel closure cleanly. Because the channel is typed, only values of one type may flow through it.",
        },
        {
          t: "play",
          prompt: "Run to see a worker thread send five squared values back to main, which collects and prints their sum.",
          code: "use std::sync::mpsc;\nuse std::thread;\n\nfn main() {\n    let (tx, rx) = mpsc::channel();\n    thread::spawn(move || {\n        for i in 1..=5 {\n            tx.send(i * i).unwrap();\n        }\n    });\n    let total: i32 = rx.iter().sum();\n    println!(\"total = {total}\");\n}",
          output: "total = 55",
          need: ["mpsc::channel", "tx.send", "rx.iter"],
        },
        {
          t: "callout",
          kind: "tip",
          html: "You can clone <code>tx</code> with <code>tx.clone()</code> to give multiple threads their own sender. All cloned senders feed the same receiver — that's the <em>multi-producer</em> in mpsc.",
        },
        {
          t: "fib",
          prompt: "Fill in the method that blocks and waits for the next message from the channel.",
          before: "let msg = rx.",
          blank: "recv",
          after: "().unwrap();",
          answer: "recv",
          hint: "Short for 'receive' — blocks the calling thread until a message arrives.",
        },
        {
          t: "callout",
          kind: "warn",
          html: "When all <code>Sender</code>s are dropped, <code>rx.recv()</code> returns <code>Err</code>, signalling channel closure. Use this as a natural loop terminator instead of sending a sentinel value.",
        },
      ],
      quiz: [
        {
          q: "What does `mpsc` stand for?",
          opts: [
            "Multiple Processes, Single Core",
            "Multi-Producer, Single-Consumer",
            "Mutex Protected Shared Channel",
            "Message Passing Synchronous Call",
          ],
          a: 1,
          why: "mpsc = multi-producer, single-consumer. Many senders can send; only one receiver can receive.",
        },
        {
          q: "How do you give multiple threads the ability to send on the same channel?",
          opts: [
            "Pass `tx` by reference to each thread",
            "Create a new channel per thread and merge them",
            "Clone `tx` for each additional sender",
            "Use `Arc<Sender<T>>`",
          ],
          a: 2,
          why: "`Sender<T>` implements `Clone`. Each clone feeds the same receiver.",
        },
      ],
      takeaways: [
        "`mpsc::channel()` returns a `(Sender<T>, Receiver<T>)` pair.",
        "Move `tx` into threads; call `tx.send(val).unwrap()` to send.",
        "When all senders drop, `rx.recv()` returns `Err` — the natural end-of-stream signal.",
      ],
    },
    {
      id: "shared-state",
      title: "Shared State",
      tag: "Mutex, Arc, and safe sharing",
      min: 13,
      xp: 220,
      blocks: [
        {
          t: "text",
          html: "Message passing is elegant, but sometimes threads really do need to share memory. Rust makes this safe with two types working together: <code>Mutex&lt;T&gt;</code> guards the data, and <code>Arc&lt;T&gt;</code> (<em>Atomically Reference Counted</em>) allows multiple owners across threads.",
        },
        {
          t: "code",
          caption: "The classic Arc<Mutex<T>> pattern",
          code: "use std::sync::{Arc, Mutex};\nuse std::thread;\n\nlet counter = Arc::new(Mutex::new(0_i32));\nlet counter2 = Arc::clone(&counter);\nlet handle = thread::spawn(move || {\n    *counter2.lock().unwrap() += 1;\n});\nhandle.join().unwrap();\nprintln!(\"{}\", counter.lock().unwrap()); // 1",
        },
        {
          t: "text",
          html: "<code>mutex.lock()</code> blocks until no other thread holds the lock, then returns a <code>MutexGuard&lt;T&gt;</code>. The guard implements <code>Deref</code> so you use <code>*guard</code> to reach the data. Crucially, the lock is <strong>released automatically</strong> when the guard goes out of scope — no <code>unlock()</code> needed.",
        },
        {
          t: "callout",
          kind: "warn",
          html: "You cannot share a plain <code>Rc&lt;Mutex&lt;T&gt;&gt;</code> across threads — <code>Rc</code> is not <code>Send</code>. Always use <code>Arc</code> for multi-threaded reference counting. The compiler will tell you if you get it wrong.",
        },
        {
          t: "play",
          prompt: "Run to see four threads each increment a shared counter, with the final value printed after all join.",
          code: "use std::sync::{Arc, Mutex};\nuse std::thread;\n\nfn main() {\n    let counter = Arc::new(Mutex::new(0_i32));\n    let mut handles = vec![];\n    for _ in 0..4 {\n        let c = Arc::clone(&counter);\n        let h = thread::spawn(move || {\n            *c.lock().unwrap() += 1;\n        });\n        handles.push(h);\n    }\n    for h in handles {\n        h.join().unwrap();\n    }\n    println!(\"counter = {}\", counter.lock().unwrap());\n}",
          output: "counter = 4",
          need: ["Arc::new", "Mutex::new", "Arc::clone", "lock().unwrap"],
        },
        {
          t: "fib",
          prompt: "Fill in the method that acquires the mutex lock and returns a `MutexGuard`.",
          before: "let mut guard = shared.lock().",
          blank: "unwrap",
          after: "();\n*guard += 1;",
          answer: "unwrap",
          hint: "`lock()` returns a `Result` — call this to panic on poisoning or get the guard.",
        },
        {
          t: "callout",
          kind: "note",
          html: "A <em>poisoned</em> mutex occurs when a thread panics while holding the lock. <code>.unwrap()</code> re-panics the current thread in that case. For production code you may want to handle <code>Err(poisoned)</code> explicitly.",
        },
      ],
      quiz: [
        {
          q: "Why use `Arc` instead of `Rc` when sharing a `Mutex` across threads?",
          opts: [
            "`Arc` is faster than `Rc`",
            "`Arc` uses atomic operations, making it safe to share across threads (`Send`); `Rc` is not `Send`",
            "`Rc` cannot hold a `Mutex`",
            "They are interchangeable — just a naming convention",
          ],
          a: 1,
          why: "`Arc` uses atomic reference counting, implementing `Send + Sync`. `Rc` is single-threaded only and the compiler rejects it in a multi-threaded context.",
        },
        {
          q: "When is a `MutexGuard` released?",
          opts: [
            "When you call `mutex.unlock()`",
            "At the end of the program",
            "When the guard goes out of scope (RAII)",
            "Only when `.drop()` is called explicitly",
          ],
          a: 2,
          why: "Rust uses RAII: the `MutexGuard` holds the lock and releases it automatically when it drops at the end of its scope.",
        },
        {
          q: "What does a 'poisoned' mutex mean?",
          opts: [
            "The mutex was never initialized",
            "A thread panicked while holding the lock",
            "Two threads deadlocked on the mutex",
            "The mutex was created with invalid data",
          ],
          a: 1,
          why: "If a thread panics while holding a `MutexGuard`, the mutex is marked poisoned. Subsequent `lock()` calls return `Err(PoisonError)`.",
        },
      ],
      takeaways: [
        "Use `Arc<Mutex<T>>` to share mutable state across threads safely.",
        "`Arc::clone(&counter)` creates a new reference-counted pointer to the same allocation.",
        "The `MutexGuard` releases the lock automatically when it drops — no manual unlock.",
      ],
    },
    {
      id: "async",
      title: "A Taste of Async",
      tag: "async/await and futures",
      min: 12,
      xp: 230,
      blocks: [
        {
          t: "text",
          html: "Async Rust lets you write <em>non-blocking</em> code that looks sequential. Mark a function <code>async fn</code> and it returns a <strong>Future</strong> — a value representing work that hasn't run yet. Call <code>.await</code> inside another async function to pause until that future resolves.",
        },
        {
          t: "code",
          caption: "Anatomy of async/await",
          code: "// An async function returns impl Future<Output = T>\nasync fn fetch_data(id: u32) -> String {\n    // .await pauses here until the inner future resolves\n    format!(\"data-{id}\")\n}\n\n#[tokio::main]\nasync fn main() {\n    let result = fetch_data(42).await;\n    println!(\"{result}\");  // data-42\n}",
        },
        {
          t: "callout",
          kind: "note",
          html: "<strong>Futures are lazy.</strong> Calling <code>fetch_data(42)</code> does <em>not</em> run any code — it just builds the future object. Only when you <code>.await</code> it (or hand it to an <em>executor</em>) does the work begin. This is fundamentally different from OS threads, which start running immediately.",
        },
        {
          t: "text",
          html: "The standard library defines the <code>Future</code> trait and the <code>async</code>/<code>await</code> syntax, but the <strong>runtime</strong> that actually drives futures must be provided by a crate such as <code>tokio</code> or <code>async-std</code>. In practice, most async Rust uses <code>tokio</code>, annotating <code>main</code> with <code>#[tokio::main]</code>.",
        },
        {
          t: "play",
          prompt: "Run to see a synchronous analogue that simulates async-style step-by-step computation using plain functions (no runtime needed for this demo).",
          code: "fn step(name: &str, value: i32) -> i32 {\n    println!(\"step {} produced {}\", name, value);\n    value\n}\n\nfn main() {\n    let a = step(\"A\", 10);\n    let b = step(\"B\", a * 2);\n    let c = step(\"C\", b + 5);\n    println!(\"final = {c}\");\n}",
          output: "step A produced 10\nstep B produced 20\nstep C produced 25\nfinal = 25",
          need: ["fn step", "fn main", "println!"],
        },
        {
          t: "callout",
          kind: "tip",
          html: "Use <code>tokio::join!</code> to run multiple futures <em>concurrently</em> on the same thread, or <code>tokio::spawn</code> to push them onto the thread pool. Async concurrency is cooperative: a future must yield (via <code>.await</code>) for others to progress.",
        },
        {
          t: "fib",
          prompt: "Fill in the keyword that pauses the current async function until the future resolves.",
          before: "let data = fetch_data(1).",
          blank: "await",
          after: ";",
          answer: "await",
          hint: "The keyword that 'waits' for a future to complete, written as a postfix after the dot.",
        },
        {
          t: "callout",
          kind: "warn",
          html: "Async and threads solve different problems. Use <strong>threads</strong> for CPU-bound parallelism (heavy computation). Use <strong>async</strong> for I/O-bound concurrency (many simultaneous network requests). Mixing the two incorrectly (e.g., blocking inside async) can stall the whole runtime.",
        },
      ],
      quiz: [
        {
          q: "What does an `async fn` return?",
          opts: ["The value directly", "A `Thread` handle", "A `Future` that produces the value when awaited", "An `Option<T>`"],
          a: 2,
          why: "Marking a function `async` wraps its return type in an `impl Future<Output = T>`. The future must be driven by an executor.",
        },
        {
          q: "Why are futures described as 'lazy'?",
          opts: [
            "They run on a background thread without telling you",
            "They do nothing until polled by an executor or awaited",
            "They cache their result and skip re-computation",
            "They require explicit memory allocation before use",
          ],
          a: 1,
          why: "Creating a future does not start any work. Work begins only when the future is `.await`ed or handed to an executor that polls it.",
        },
        {
          q: "Which crate provides the most popular async runtime for Rust?",
          opts: ["async-runtime", "futures-std", "tokio", "rayon"],
          a: 2,
          why: "`tokio` is the most widely used async runtime. It provides the executor, I/O primitives, timers, and `#[tokio::main]`.",
        },
      ],
      takeaways: [
        "`async fn` returns a lazy `Future`; nothing runs until you `.await` it or an executor polls it.",
        "You need a runtime (e.g., `tokio`) to drive futures — the standard library only defines the trait.",
        "Prefer threads for CPU-bound work and async for I/O-bound concurrency.",
      ],
    },
  ],
});

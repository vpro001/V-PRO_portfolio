const { MongoClient, ObjectId } = require("mongodb");
(async () => {
  const c = await MongoClient.connect("mongodb://127.0.0.1:27099/vpro_test");
  const db = c.db();
  await db.dropDatabase();
  const now = new Date();
  await db.collection("users").insertOne({ username: "admin", email: "admin@test.local", password: "admin12345", role: "admin", createdAt: now });
  await db.collection("projects").insertMany([
    { name: "Ledgerline", description: "Invoicing and reconciliation platform for small logistics firms, with bank-transfer matching and role-based approvals.", imageUrl: "https://picsum.photos/seed/a1/1200/800", link: "https://example.com", status: "Live", category: "Web app", technologies: ["Laravel", "MySQL", "Tailwind CSS"], featured: true, createdAt: now },
    { name: "Classroom", description: "Course marketplace with Flutterwave checkout, progress tracking and verifiable certificates.", imageUrl: "https://picsum.photos/seed/b2/1200/800", link: "https://example.com", status: "Live", category: "Platform", technologies: ["Next.js", "MongoDB", "Flutterwave"], featured: true, createdAt: now },
    { name: "Dispatch API", description: "Delivery-tracking API consumed by a mobile app and a partner dashboard.", imageUrl: "", link: "", status: "In development", category: "API", technologies: ["Node.js", "TypeScript"], featured: false, createdAt: now },
  ]);
  const L = (t, d, v, o, pub = true) => ({ _id: new ObjectId(), title: t, description: d, videoUrl: v, duration: 12 + o * 7, order: o, isPublished: pub, resources: o === 1 ? [{ title: "Starter repo", url: "https://github.com" }] : [] });
  await db.collection("courses").insertMany([
    { title: "Laravel APIs From First Route to Production", description: "Build, secure and deploy a real REST API with Laravel. We model the data, write the endpoints, add auth and roles, then ship it.", category: "Backend", price: 0, level: "beginner", language: "English", students: 0, thumbnail: "", previewVideoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      lessons: [L("What we're building", "A tour of the finished API and the plan for the course.\n\nRead the brief before starting.", "https://www.youtube.com/watch?v=M7lc1UVf-VE", 1), L("Modelling the data", "Tables, relations and migrations.", "https://www.youtube.com/watch?v=aqz-KE-bpKQ", 2), L("Reading week", "No video for this one — work through the exercises.", "", 3), L("Draft lesson", "hidden", "", 4, false)],
      requirements: ["Basic PHP", "A laptop with PHP 8.2+"], objectives: ["Design a clean REST API", "Add token auth and roles", "Deploy to a VPS"], isPublished: true, createdAt: now, updatedAt: now },
    { title: "Payments With Flutterwave, Done Properly", description: "Checkout, verification, webhooks and reconciliation for Nigerian products.", category: "Payments", price: 25000, originalPrice: 40000, level: "intermediate", language: "English", students: 0, thumbnail: "https://picsum.photos/seed/c3/1200/800", previewVideoUrl: "",
      lessons: [L("How money actually moves", "", "https://www.youtube.com/watch?v=M7lc1UVf-VE", 1), L("Hosted checkout", "", "https://www.youtube.com/watch?v=aqz-KE-bpKQ", 2)],
      requirements: [], objectives: ["Verify every payment server-side"], isPublished: true, createdAt: now, updatedAt: now },
    { title: "Unpublished draft course", description: "Should not be visible publicly.", category: "Draft", price: 1000, level: "advanced", lessons: [], isPublished: false, createdAt: now, updatedAt: now },
  ]);
  console.log("seeded");
  await c.close();
})();

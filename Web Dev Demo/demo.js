// // I want you to create a new function called updateLastUserActivityTime which returns a promise, we will use this function to update the user's last activity time, and when it will resolve, it should send back the updated last activity time for the user (it should take 1 second to execute).
// // Every time the user creates a post, updateLastUserActivityTime should be called so that the user's last activity time gets updated.
// // .When both the promises resolve (createPost and updateLastUserActivityTime ),
// // I want you to console log all the posts and lastActivityTime of the user. [If stuck for long watch the hint 2]
// // Once both the above promises are resolved, I want you to delete the last post by calling the deletePost promise. Once successfully deleted, I want you to log the remaining Posts.
// function createPost(userId, postContent) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const post = { userId, content: postContent };
//       resolve(post);
//     }, 500);
//   });
// }
async function createPost(userId, postContent) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const post = { userId, content: postContent };
      resolve(post);
    }, 500);
  });
}

function updateLastUserActivityTime(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lastSeen = new Date().toISOString();
      resolve(lastSeen);
    }, 1000);
  });
}
// function deletePost(post) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve();
//     }, 500);
//   });
// }
async function deletePost(post) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}

async function controlPostFlow(userId, postContent) {
  const updateLastUserActivityPromise = await updateLastUserActivityTime(
    userId
  );
  const createPostPromise = await createPost(userId, postContent);

  Promise.all([updateLastUserActivityPromise, createPostPromise])
    .then(([lastActivityTime, post]) => {
      console.log(`users ${userId} was lat active ${lastActivityTime}`);
      console.log("All Post", [post]);

      deletePost();
    })
    .then(() => {
      console.log("post Deleted");
    })
    .catch((err) => {
      console.log(error);
    });
}

userId = "user1";
postContent = "happy Diwali";

controlPostFlow(userId, postContent);

//promise
console.log("Person 1: shows ticket");
console.log("Person 2: shows ticket");

const promiseWifeBringingTicks = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("ticket");
  }, 3000);
});

const getPopcorn = promiseWifeBringingTicks.then((t) => {
  console.log("wife: i have tickets");
  console.log("husband: we should go in");
  console.log("wife: no i am hungy");
  return new Promise((resolve, reject) => resolve(`${t} popcorn`));
});
const getButter = getPopcorn.then((t) => {
  console.log("husband: i got popcorn");
  console.log("husband: we should go in");
  console.log("wife: I need butter on my popcorn");
  return new Promise((resolve, reject) => resolve(`${t} butter`));
});

const getColdDrinks = getButter.then((t) => {
  console.log("husband: i got cold drinks");

  return new Promise((resolve, reject) => {
    resolve(`{t} cold Drinks`);
  });
});
console.log("Person 4: shows ticket");
console.log("Person 5: shows ticket");

// //Async Await
console.log("Person 1: shows ticket");
console.log("Person 2: shows ticket");

const preMovie = async () => {
  const promiseWifeBringingTicks = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("ticket");
    }, 3000);
  });
  const getPopcorn = new Promise((resolve, reject) => resolve(`popcorn`));
  const getButter = new Promise((resolve, reject) => resolve(`butter`));
  const getColdDrinks = new Promise((resolve, reject) => resolve(`cold drink`));

  let ticket = await promiseWifeBringingTicks;
  console.log(`wife: i have ${ticket}`);
  console.log("husband: we should go in");
  console.log("wife: no i am hungy");

  let popcorn = await getPopcorn;
  console.log(`husband: i got ${popcorn}`);
  console.log("husband: we should go in");
  console.log("wife: I need butter on my popcorn");

  let butter = await getButter;
  console.log(`husband: i got ${butter}`);
  console.log(`husband: anything else darling?`);
  console.log(`wife: lets go we are getting late`);
  console.log(`husband: thank you for the reminder *grins*`);
  let coldDrink = await getColdDrinks;
  console.log(`husband: i got ${coldDrink}`);
  return ticket;
};

preMovie().then((m) => {
  console.log(`person 3: shows ${m}`);
});
console.log("Person 4: shows ticket");
console.log("Person 5: shows ticket");

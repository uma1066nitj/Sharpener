// I want you to create a new function called updateLastUserActivityTime which returns a promise, we will use this function to update the user's last activity time, and when it will resolve, it should send back the updated last activity time for the user (it should take 1 second to execute).
// Every time the user creates a post, updateLastUserActivityTime should be called so that the user's last activity time gets updated.
// .When both the promises resolve (createPost and updateLastUserActivityTime ),
// I want you to console log all the posts and lastActivityTime of the user. [If stuck for long watch the hint 2]
// Once both the above promises are resolved, I want you to delete the last post by calling the deletePost promise. Once successfully deleted, I want you to log the remaining Posts.
function createPost(userId, postContent) {
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
function deletePost(post) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}
// updateLastUserActivityTime()
//   .then((lastSeen) => {
//     console.log(`user was active last time at ${lastSeen}`);
//     createPost();
//   })
//   .catch((error) => {
//     console.log(error);
//   });
function controlPostFlow(userId, postContent) {
  const updateLastUserActivityPromise = updateLastUserActivityTime(userId);
  const createPostPromise = createPost(userId, postContent);

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

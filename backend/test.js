require("dotenv").config();
const axios = require("axios");

async function test() {
  try {
    const start = await axios.post(
      "https://anakin.io/v1/wire/task",
      {
        action_id: "gf_search_flights",
        params: {
          origin: "DEL",
          destination: "BOM",
          date: "2026-06-15"
        }
      },
      {
        headers: {
          "X-API-Key": process.env.ANAKIN_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("JOB CREATED:");
    console.log(start.data);

    const jobId = start.data.job_id;

    await new Promise(resolve => setTimeout(resolve, 5000));

    const result = await axios.get(
      `https://anakin.io/v1/wire/jobs/${jobId}`,
      {
        headers: {
          "X-API-Key": process.env.ANAKIN_API_KEY
        }
      }
    );

    console.log("RESULT:");
    console.log(JSON.stringify(result.data, null, 2));

  } catch (err) {
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
    console.log("MESSAGE:", err.message);
  }
}

test();
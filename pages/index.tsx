import type { GetServerSideProps } from "next";
import type { Record } from "../types";

import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { DONATION_IN_CENTS, MAX_DONATION_IN_CENTS } from "../config";

export default function Home({ donations }: { donations: Array<Record> }) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<any>(null);

  const presets = [1, 3, 5];

  async function handleCheckout() {
    setError(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
        name,
        message,
      }),
    });

    const res = await response.json();

    if (res.url) {
      const url = res.url;
      router.push(url);
    }

    if (res.error) {
      setError(res.error);
    }
  }

  return (
    <main className="flex gap-5 max-w-2xl mx-auto my-5">
      <div className="flex-1 space-y-7 p-7">
        <h2 className="text-2xl">Previous donations</h2>
        <ul className="space-y-3">
          {donations.map((donation) => (
            <li key={donation.id} className="p-4 shadow">
              {donation.fields.name} donated ${donation.fields.amount}
              <br />
              {donation.fields.message}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-7 p-7 rounded bg-sky-50">
        <h1 className="font-semibold text-3xl">Buy me a beer</h1>
        {error && <div className="text-red-500">{error}</div>}
        <div className="space-y-3">
          <div className="flex gap-4 items-center w-full p-7 border border-sky-300 bg-sky-200 rounded">
            <span>
              <Image src="/beer.svg" width={50} height={50} alt="beer" />
            </span>
            <span className="text-sky-600">X</span>
            <div className="flex gap-2">
              {presets.map((preset) => (
                <button
                  key={`button-${preset}`}
                  onClick={() => setQuantity(preset)}
                  className={`w-9 h-9 rounded-full font-bold text-lg border border-sky-600 transition duration-300 ${
                    quantity === preset
                      ? "bg-sky-600 text-sky-50"
                      : "bg-sky-50 text-sky-600"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              value={quantity}
              min={1}
              max={MAX_DONATION_IN_CENTS / DONATION_IN_CENTS}
              className="text-center w-14 h-9 text-lg rounded border border-sky-300"
            />
          </div>
          <div>
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <input
              type="text"
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className={`w-full p-3 border border-sky-300 rounded placeholder:text-slate-400 transition duration-300 ${
                message ? "bg-white" : "bg-slate-100 focus:bg-white"
              }`}
            />
          </div>

          <div>
            <label htmlFor="message" className="sr-only">
              Message
            </label>
            <textarea
              id="message"
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message (optional)"
              rows={3}
              className={`w-full p-3 border border-sky-300 rounded resize-none placeholder:text-slate-400 transition duration-300 ${
                message ? "bg-white" : "bg-slate-100 focus:bg-white"
              }`}
            />
          </div>
        </div>
        <button
          onClick={handleCheckout}
          className="p-3 w-full bg-sky-600 text-sky-50 rounded enabled:hover:scale-[1.03] transition duration-300"
        >
          Donate ${(quantity * DONATION_IN_CENTS) / 100}
        </button>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const protocol = ctx.req.headers["x-forwarded-proto"] || "http";
  const host = ctx.req.headers.host;

  const response = await fetch(`${protocol}://${host}/api/donations`);

  const donations = await response.json();

  return { props: { donations } };
};

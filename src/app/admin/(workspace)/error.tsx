'use client';
export default function WorkspaceError({reset}:{error:Error;reset:()=>void}){return <section className="admin-empty"><h1>This page couldn’t be loaded.</h1><p>The connection may be unavailable, or your access may have changed. No unsaved change has been confirmed.</p><button className="admin-button" onClick={reset}>Try again</button><a href="/admin">Return to overview</a></section>;}

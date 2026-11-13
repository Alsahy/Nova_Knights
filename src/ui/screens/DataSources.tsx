import { copy } from '../../content/copy';
import { SOURCES, SPEC_VERSION } from '../../content/sources';

export function DataSources({ back }: { back: () => void }) {
  return (
    <section aria-labelledby="sources-title">
      <button class="btn btn-back" onClick={back}>
        ← {copy.back}
      </button>
      <h1 id="sources-title" tabIndex={-1}>
        {copy.sources.title}
      </h1>
      <p>{copy.sources.intro}</p>
      <p class="hint">{copy.sources.placeholder}</p>
      <ol class="source-list">
        {SOURCES.map((s) => (
          <li key={s.id} id={s.id}>
            <strong>[{s.id}]</strong> {s.title}
            {s.urls.map((u) => (
              <>
                {' '}
                <a href={u} target="_blank" rel="noopener noreferrer">
                  {new URL(u).hostname.replace(/^www\./, '')}
                </a>
              </>
            ))}
          </li>
        ))}
      </ol>
      <h2>{copy.sources.credits}</h2>
      <ul>
        {copy.sources.creditLines.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <p class="hint">{copy.sources.specVersion(SPEC_VERSION)}</p>
    </section>
  );
}

import { AudioPlayer } from "@/components/AudioPlayer";
import type { ReadingRuleView, StudyCardView } from "@/lib/types";

export function StudyCard({ card }: { card: StudyCardView }) {
  return (
    <section className="card lessonCard stack-lg">
      <div className="symbolWrap">
        <span className="symbolBadge">{card.symbolOrCombination}</span>
        {card.label ? <p className="muted">{card.label}</p> : null}
      </div>

      <div className="stack-md">
        <div>
          <h2>How it sounds</h2>
          <p>{card.explanation}</p>
        </div>
        <AudioPlayer audio={card.audio} />
      </div>

      <div className="grid twoCols">
        {card.stressNote ? (
          <article className="subCard">
            <h3>Stress note</h3>
            <p>{card.stressNote}</p>
          </article>
        ) : null}
        {card.commonMistakes ? (
          <article className="subCard">
            <h3>Common mistakes</h3>
            <p>{card.commonMistakes}</p>
          </article>
        ) : null}
        {card.comparisonNote ? (
          <article className="subCard fullWidth">
            <h3>Compare with similar sounds</h3>
            <p>{card.comparisonNote}</p>
          </article>
        ) : null}
      </div>

      <div className="stack-md">
        <h2>Examples</h2>
        <div className="grid twoCols">
          {card.examples.map((example) => (
            <article key={example.id} className="subCard stack-sm">
              <div>
                <strong>{example.word}</strong>
                {example.transcription ? <p className="mono">{example.transcription}</p> : null}
                {example.translation ? <p className="muted">{example.translation}</p> : null}
              </div>
              {example.note ? <p>{example.note}</p> : null}
              <AudioPlayer audio={example.audio} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReadingRuleCard({ rule }: { rule: ReadingRuleView }) {
  return (
    <section className="card lessonCard stack-lg">
      <div className="stack-sm">
        <p className="eyebrow">Rule statement</p>
        <h2>{rule.ruleStatement}</h2>
        <p>{rule.explanation}</p>
      </div>

      <div className="grid twoCols">
        {rule.exceptions ? (
          <article className="subCard">
            <h3>Exceptions</h3>
            <p>{rule.exceptions}</p>
          </article>
        ) : null}
        {rule.limitations ? (
          <article className="subCard">
            <h3>Limits</h3>
            <p>{rule.limitations}</p>
          </article>
        ) : null}
      </div>

      <div className="stack-md">
        <h2>Examples</h2>
        <div className="grid twoCols">
          {rule.examples.map((example) => (
            <article key={example.id} className="subCard stack-sm">
              <strong>{example.word}</strong>
              {example.transcription ? <p className="mono">{example.transcription}</p> : null}
              {example.translation ? <p className="muted">{example.translation}</p> : null}
              {example.note ? <p>{example.note}</p> : null}
              <AudioPlayer audio={example.audio} />
            </article>
          ))}
        </div>
      </div>

      <div className="stack-md">
        <h2>Reinforcement</h2>
        <p>{rule.practiceIntro ?? "Use the linked exercise to practise the rule in context."}</p>
        <div className="grid">
          {rule.reinforcementExercises.map((exercise) => (
            <a key={exercise.slug} className="subCard exerciseLink" href={`#exercise-${exercise.slug}`}>
              <strong>{exercise.title}</strong>
              {exercise.summary ? <p>{exercise.summary}</p> : null}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

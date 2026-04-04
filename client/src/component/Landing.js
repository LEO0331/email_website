import React from 'react';

const Landing = () => {
	return (
		<section className="landing editorial-reveal">
			<p className="landing-kicker reveal-step">Signal-first email surveys</p>
			<h1 className="landing-title reveal-step">
				Find out what users actually think before the roadmap locks in.
			</h1>
			<p className="landing-subtitle reveal-step">
				Emaily helps teams send clean, focused surveys and turn replies into decisions.
				No dashboard bloat, no guesswork, just sharp feedback loops.
			</p>
			<div className="landing-grid reveal-step">
				<article className="landing-panel panel-primary">
					<h2>Built for product teams under pressure</h2>
					<p>
						Launch campaigns in minutes, track yes/no outcomes instantly,
						and keep every response tied to a clear question.
					</p>
				</article>
				<article className="landing-panel panel-secondary">
					<p className="panel-metric">87%</p>
					<p className="panel-note">average open rate on our highest-performing short-form surveys</p>
				</article>
			</div>
			<div className="landing-steps reveal-step">
				<div>
					<span>01</span>
					<p>Draft a focused prompt</p>
				</div>
				<div>
					<span>02</span>
					<p>Send to segmented recipients</p>
				</div>
				<div>
					<span>03</span>
					<p>Act on measurable sentiment</p>
				</div>
			</div>
		</section>
	);
};

export default Landing;
